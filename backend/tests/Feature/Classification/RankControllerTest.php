<?php

namespace Tests\Feature\Classification;

use App\Models\Rank;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RankControllerTest extends TestCase
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

    public function test_can_list_ranks(): void
    {
        Rank::create(['name' => 'Consultant', 'level' => 1]);
        Rank::create(['name' => 'Specialist', 'level' => 2]);

        $response = $this->json('GET', '/api/v1/ranks', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'description', 'level', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_rank(): void
    {
        $response = $this->json('POST', '/api/v1/ranks', [
            'name' => 'Consultant',
            'description' => 'Senior consultant',
            'level' => 1,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Rank created successfully',
            ]);

        $this->assertDatabaseHas('ranks', [
            'name' => 'Consultant',
            'level' => 1,
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_duplicate_rank(): void
    {
        Rank::create(['name' => 'Consultant']);

        $this->json('POST', '/api/v1/ranks', [
            'name' => 'Consultant',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_rank(): void
    {
        $rank = Rank::create(['name' => 'Specialist', 'level' => 2]);

        $response = $this->json('GET', "/api/v1/ranks/{$rank->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Rank retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Specialist');
    }

    public function test_returns_404_for_nonexistent_rank(): void
    {
        $this->json('GET', '/api/v1/ranks/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_rank(): void
    {
        $rank = Rank::create(['name' => 'Junior', 'level' => 3]);

        $response = $this->json('PUT', "/api/v1/ranks/{$rank->id}", [
            'name' => 'Senior',
            'level' => 2,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Rank updated successfully',
            ]);

        $this->assertDatabaseHas('ranks', [
            'id' => $rank->id,
            'name' => 'Senior',
            'level' => 2,
        ]);
    }

    public function test_can_delete_rank(): void
    {
        $rank = Rank::create(['name' => 'Temporary']);

        $response = $this->json('DELETE', "/api/v1/ranks/{$rank->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Rank deleted successfully',
            ]);

        $this->assertSoftDeleted('ranks', ['id' => $rank->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/ranks')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/ranks', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
