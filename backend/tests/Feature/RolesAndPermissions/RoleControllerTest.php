<?php

namespace Tests\Feature\RolesAndPermissions;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        // Run the migration seeder data first so roles exist
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Assign the Super Admin role to the user so they pass permission checks
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        $this->adminUser->roles()->sync([$superAdminRole->id]);
    }

    public function test_can_list_roles(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/roles');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'description', 'guard_name'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_role(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/roles', [
                'name' => 'Test Role',
                'description' => 'A test role',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Role created successfully',
            ]);

        $this->assertDatabaseHas('roles', [
            'name' => 'Test Role',
            'description' => 'A test role',
        ]);
    }

    public function test_cannot_create_duplicate_role(): void
    {
        $this->actingAs($this->adminUser)
            ->postJson('/api/v1/roles', [
                'name' => 'Super Admin',
                'description' => 'Duplicate',
            ])->assertStatus(422);
    }

    public function test_can_show_role(): void
    {
        $role = Role::where('name', 'Super Admin')->first();

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/v1/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Role retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Super Admin');
    }

    public function test_returns_404_for_nonexistent_role(): void
    {
        $this->actingAs($this->adminUser)
            ->getJson('/api/v1/roles/99999')
            ->assertStatus(404);
    }

    public function test_can_update_role(): void
    {
        $role = Role::where('name', 'Manager')->first();

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/roles/{$role->id}", [
                'name' => 'Senior Manager',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Role updated successfully',
            ]);

        $this->assertDatabaseHas('roles', [
            'id' => $role->id,
            'name' => 'Senior Manager',
            'description' => 'Updated description',
        ]);
    }

    public function test_can_delete_role(): void
    {
        $role = Role::create([
            'name' => 'Temp Role',
            'description' => 'To be deleted',
            'guard_name' => 'web',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/roles/{$role->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Role deleted successfully',
            ]);

        $this->assertSoftDeleted('roles', ['id' => $role->id]);
    }

    public function test_can_get_role_permissions(): void
    {
        $role = Role::where('name', 'Super Admin')->first();

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/v1/roles/{$role->id}/permissions");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permissions retrieved successfully',
            ]);
    }

    public function test_can_sync_role_permissions(): void
    {
        $role = Role::where('name', 'Staff')->first();
        $permissions = Permission::whereIn('name', ['staff.view', 'evaluations.view'])->pluck('id')->toArray();

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/roles/{$role->id}/permissions", [
                'permission_ids' => $permissions,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permissions synced successfully',
            ]);

        $this->assertCount(2, $role->fresh()->permissions);
    }

    public function test_can_get_user_roles(): void
    {
        $user = User::factory()->create(['role' => 'staff']);
        $role = Role::where('name', 'Staff')->first();
        $user->roles()->attach($role);

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/v1/users/{$user->id}/roles");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User roles retrieved successfully',
            ]);
    }

    public function test_can_assign_roles_to_user(): void
    {
        $user = User::factory()->create(['role' => 'staff']);
        $role1 = Role::where('name', 'Manager')->first();
        $role2 = Role::where('name', 'Evaluator')->first();

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/users/{$user->id}/roles", [
                'role_ids' => [$role1->id, $role2->id],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Roles assigned successfully',
            ]);

        $this->assertCount(2, $user->fresh()->roles);
    }

    public function test_returns_404_for_nonexistent_user_roles(): void
    {
        $this->actingAs($this->adminUser)
            ->getJson('/api/v1/users/99999/roles')
            ->assertStatus(404);
    }
}
