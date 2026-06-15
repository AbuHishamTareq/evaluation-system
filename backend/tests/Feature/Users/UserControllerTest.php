<?php

namespace Tests\Feature\Users;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $role = Role::where('name', 'Super Admin')->first();
        $this->user->roles()->sync([$role->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->headers = ['Authorization' => 'Bearer '.$this->token];
    }

    public function test_can_list_users(): void
    {
        User::factory()->count(3)->create();

        $response = $this->json('GET', '/api/v1/users', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'email', 'role', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_user(): void
    {
        $response = $this->json('POST', '/api/v1/users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'role' => 'staff',
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'role' => 'staff',
        ]);
    }

    public function test_cannot_create_user_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $this->json('POST', '/api/v1/users', [
            'name' => 'Duplicate',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'role' => 'staff',
        ], $this->headers)->assertStatus(422);
    }

    public function test_cannot_create_user_with_invalid_role(): void
    {
        $this->json('POST', '/api/v1/users', [
            'name' => 'Invalid',
            'email' => 'invalid@example.com',
            'password' => 'password123',
            'role' => 'superadmin',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_user(): void
    {
        $targetUser = User::factory()->create(['name' => 'Jane Doe']);

        $response = $this->json('GET', "/api/v1/users/{$targetUser->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Jane Doe');
    }

    public function test_returns_404_for_nonexistent_user(): void
    {
        $this->json('GET', '/api/v1/users/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_user(): void
    {
        $targetUser = User::factory()->create(['name' => 'Old Name']);

        $response = $this->json('PUT', "/api/v1/users/{$targetUser->id}", [
            'name' => 'New Name',
            'role' => 'manager',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User updated successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'New Name',
            'role' => 'manager',
        ]);
    }

    public function test_can_toggle_user_active_status(): void
    {
        $targetUser = User::factory()->create(['is_active' => true]);

        $response = $this->json('PATCH', "/api/v1/users/{$targetUser->id}/toggle-active", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User deactivated successfully',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'is_active' => false,
        ]);
    }

    public function test_can_delete_user(): void
    {
        $targetUser = User::factory()->create();

        $response = $this->json('DELETE', "/api/v1/users/{$targetUser->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User deleted successfully',
            ]);

        $this->assertSoftDeleted('users', ['id' => $targetUser->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/users')->assertStatus(401);
    }
}
