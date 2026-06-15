<?php

namespace Tests\Feature\RolesAndPermissions;

use App\Features\RolesAndPermissions\Services\PermissionRegistryService;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolesAndPermissionsIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_permission_registry_returns_all_permissions(): void
    {
        $registry = app(PermissionRegistryService::class);
        $permissions = $registry->getAll();

        $this->assertNotEmpty($permissions);
        $this->assertArrayHasKey('staff.view', $permissions);
        $this->assertArrayHasKey('roles.view', $permissions);
        $this->assertArrayHasKey('evaluations.submit', $permissions);
        $this->assertArrayHasKey('settings.manage', $permissions);

        // Verify all permissions exist in the database
        foreach (array_keys($permissions) as $name) {
            $this->assertDatabaseHas('permissions', ['name' => $name]);
        }
    }

    public function test_super_admin_has_all_permissions(): void
    {
        $role = Role::where('name', 'Super Admin')->first();
        $totalPermissions = Permission::count();

        $this->assertEquals($totalPermissions, $role->permissions()->count());
    }

    public function test_manager_has_appropriate_permissions(): void
    {
        $role = Role::where('name', 'Manager')->first();
        $permissionNames = $role->permissions->pluck('name')->toArray();

        $this->assertContains('staff.view', $permissionNames);
        $this->assertContains('centers.create', $permissionNames);
        $this->assertContains('reports.view', $permissionNames);

        // Manager should NOT have these
        $this->assertNotContains('settings.manage', $permissionNames);
        $this->assertNotContains('roles.create', $permissionNames);
    }

    public function test_evaluator_has_limited_permissions(): void
    {
        $role = Role::where('name', 'Evaluator')->first();
        $permissionNames = $role->permissions->pluck('name')->toArray();

        $this->assertContains('evaluations.create', $permissionNames);
        $this->assertContains('staff.view', $permissionNames);

        // Evaluator should NOT have these
        $this->assertNotContains('centers.create', $permissionNames);
        $this->assertNotContains('staff.create', $permissionNames);
    }

    public function test_user_has_permission_through_roles(): void
    {
        $user = User::factory()->create(['role' => 'staff']);
        $evaluatorRole = Role::where('name', 'Evaluator')->first();
        $user->roles()->attach($evaluatorRole);

        $this->assertTrue($user->hasPermission('evaluations.view'));
        $this->assertTrue($user->hasPermission('staff.view'));
        $this->assertFalse($user->hasPermission('settings.manage'));
    }

    public function test_user_has_any_permission(): void
    {
        $user = User::factory()->create(['role' => 'staff']);
        $staffRole = Role::where('name', 'Staff')->first();
        $user->roles()->attach($staffRole);

        $this->assertTrue($user->hasAnyPermission(['staff.view', 'settings.manage']));
        $this->assertFalse($user->hasAnyPermission(['settings.manage', 'roles.create']));
    }

    public function test_permissions_sync_command_works(): void
    {
        // Remove a permission from the registry and run sync
        $permission = Permission::where('name', 'staff.view')->first();
        $permission->delete();

        $this->assertSoftDeleted('permissions', ['name' => 'staff.view']);

        $this->artisan('permissions:sync')
            ->assertSuccessful();

        // The permission should be restored
        $this->assertDatabaseHas('permissions', ['name' => 'staff.view', 'deleted_at' => null]);
    }

    public function test_full_flow_assign_role_to_user_and_check_permissions(): void
    {
        $user = User::factory()->create(['role' => 'staff']);
        $managerRole = Role::where('name', 'Manager')->first();

        // Assign manager role to user
        $adminUser = User::factory()->create(['role' => 'admin', 'is_active' => true]);
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        $adminUser->roles()->sync([$superAdminRole->id]);
        $this->actingAs($adminUser)
            ->putJson("/api/v1/users/{$user->id}/roles", [
                'role_ids' => [$managerRole->id],
            ])->assertStatus(200);

        // Verify the user now has manager permissions
        $this->assertTrue($user->fresh()->hasPermission('staff.create'));
        $this->assertTrue($user->fresh()->hasPermission('centers.edit'));

        // Verify via the API
        $this->actingAs($adminUser)
            ->getJson("/api/v1/users/{$user->id}/roles")
            ->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Manager');
    }
}
