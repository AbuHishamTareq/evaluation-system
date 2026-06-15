<?php

namespace Tests\Feature\TeamCodes;

use App\Models\Role;
use App\Models\TeamCode;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamCodeControllerTest extends TestCase
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

    public function test_can_list_team_codes(): void
    {
        TeamCode::create(['code' => 'TC001', 'description' => 'Team A', 'role' => 'staff']);
        TeamCode::create(['code' => 'TC002', 'description' => 'Team B', 'role' => 'staff']);

        $response = $this->json('GET', '/api/v1/team-codes', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'code', 'description', 'role', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_team_code(): void
    {
        $response = $this->json('POST', '/api/v1/team-codes', [
            'code' => 'TC003',
            'description' => 'Team C',
            'role' => 'evaluator',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Team code created successfully',
            ]);

        $this->assertDatabaseHas('team_codes', [
            'code' => 'TC003',
            'role' => 'evaluator',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_duplicate_team_code(): void
    {
        TeamCode::create(['code' => 'TC001', 'role' => 'staff']);

        $this->json('POST', '/api/v1/team-codes', [
            'code' => 'TC001',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_team_code(): void
    {
        $teamCode = TeamCode::create(['code' => 'TC010', 'description' => 'Team X']);

        $response = $this->json('GET', "/api/v1/team-codes/{$teamCode->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Team code retrieved successfully',
            ])
            ->assertJsonPath('data.code', 'TC010');
    }

    public function test_returns_404_for_nonexistent_team_code(): void
    {
        $this->json('GET', '/api/v1/team-codes/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_team_code(): void
    {
        $teamCode = TeamCode::create(['code' => 'TC020', 'description' => 'Old Description']);

        $response = $this->json('PUT', "/api/v1/team-codes/{$teamCode->id}", [
            'description' => 'New Description',
            'role' => 'manager',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Team code updated successfully',
            ]);

        $this->assertDatabaseHas('team_codes', [
            'id' => $teamCode->id,
            'description' => 'New Description',
            'role' => 'manager',
        ]);
    }

    public function test_can_toggle_team_code_status(): void
    {
        $teamCode = TeamCode::create(['code' => 'TC030', 'is_active' => true]);

        $response = $this->json('PATCH', "/api/v1/team-codes/{$teamCode->id}/toggle-status", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Team code status toggled successfully',
            ]);

        $this->assertDatabaseHas('team_codes', [
            'id' => $teamCode->id,
            'is_active' => false,
        ]);
    }

    public function test_can_delete_team_code(): void
    {
        $teamCode = TeamCode::create(['code' => 'TC040']);

        $response = $this->json('DELETE', "/api/v1/team-codes/{$teamCode->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Team code deleted successfully',
            ]);

        $this->assertDatabaseMissing('team_codes', ['id' => $teamCode->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/team-codes')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/team-codes', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
