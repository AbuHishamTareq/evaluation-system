<?php

namespace Tests\Feature\RolesAndPermissions;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Assign the Super Admin role to the user so they pass permission checks
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        $this->adminUser->roles()->sync([$superAdminRole->id]);
    }

    public function test_can_list_permissions(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->getJson('/api/v1/permissions');

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

    public function test_can_create_permission(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->postJson('/api/v1/permissions', [
                'name' => 'test.permission',
                'description' => 'A test permission',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Permission created successfully',
            ]);

        $this->assertDatabaseHas('permissions', [
            'name' => 'test.permission',
            'description' => 'A test permission',
        ]);
    }

    public function test_cannot_create_duplicate_permission(): void
    {
        $this->actingAs($this->adminUser)
            ->postJson('/api/v1/permissions', [
                'name' => 'staff.view',
                'description' => 'Duplicate',
            ])->assertStatus(422);
    }

    public function test_can_show_permission(): void
    {
        $permission = Permission::where('name', 'staff.view')->first();

        $response = $this->actingAs($this->adminUser)
            ->getJson("/api/v1/permissions/{$permission->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permission retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'staff.view');
    }

    public function test_returns_404_for_nonexistent_permission(): void
    {
        $this->actingAs($this->adminUser)
            ->getJson('/api/v1/permissions/99999')
            ->assertStatus(404);
    }

    public function test_can_update_permission(): void
    {
        $permission = Permission::where('name', 'staff.view')->first();

        $response = $this->actingAs($this->adminUser)
            ->putJson("/api/v1/permissions/{$permission->id}", [
                'name' => 'staff.view_updated',
                'description' => 'Updated description',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permission updated successfully',
            ]);

        $this->assertDatabaseHas('permissions', [
            'id' => $permission->id,
            'name' => 'staff.view_updated',
        ]);
    }

    public function test_can_delete_permission(): void
    {
        $permission = Permission::create([
            'name' => 'temp.permission',
            'description' => 'To be deleted',
            'guard_name' => 'web',
        ]);

        $response = $this->actingAs($this->adminUser)
            ->deleteJson("/api/v1/permissions/{$permission->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Permission deleted successfully',
            ]);

        $this->assertSoftDeleted('permissions', ['id' => $permission->id]);
    }
}
