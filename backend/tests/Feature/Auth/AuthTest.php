<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $role = Role::where('name', 'Super Admin')->first();
        $this->user->roles()->sync([$role->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->headers = ['Authorization' => 'Bearer '.$this->token];
    }

    public function test_user_can_register(): void
    {
        $response = $this->json('POST', '/api/v1/auth/register', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'email'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'name' => 'New User',
        ]);
    }

    public function test_user_cannot_register_with_missing_fields(): void
    {
        $response = $this->json('POST', '/api/v1/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
        ]);

        $response->assertStatus(422);
    }

    public function test_user_can_login(): void
    {
        $response = $this->json('POST', '/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['user', 'token'],
            ]);
    }

    public function test_user_cannot_login_with_wrong_credentials(): void
    {
        $response = $this->json('POST', '/api/v1/auth/login', [
            'email' => $this->user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials',
            ]);
    }

    public function test_authenticated_user_can_get_own_profile(): void
    {
        $response = $this->json('GET', '/api/v1/auth/me', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User retrieved successfully',
            ])
            ->assertJsonPath('data.email', $this->user->email);
    }

    public function test_user_can_logout(): void
    {
        $response = $this->json('POST', '/api/v1/auth/logout', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully',
            ]);
    }

    public function test_user_can_get_permissions(): void
    {
        $response = $this->json('GET', '/api/v1/auth/permissions', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
            ]);

        // Super Admin should have all permissions
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_user_can_change_password(): void
    {
        $response = $this->json('POST', '/api/v1/auth/change-password', [
            'current_password' => 'password',
            'new_password' => 'newpassword123',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Password changed successfully',
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->json('GET', '/api/v1/auth/me');

        $response->assertStatus(401);
    }
}
