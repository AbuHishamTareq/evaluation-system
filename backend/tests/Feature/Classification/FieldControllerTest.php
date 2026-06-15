<?php

namespace Tests\Feature\Classification;

use App\Models\Field;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FieldControllerTest extends TestCase
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

    public function test_can_list_fields(): void
    {
        Field::create(['name' => 'General Medicine', 'description' => 'General Medicine field']);
        Field::create(['name' => 'Surgery', 'description' => 'Surgery field']);

        $response = $this->json('GET', '/api/v1/fields', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_field(): void
    {
        $response = $this->json('POST', '/api/v1/fields', [
            'name' => 'General Medicine',
            'description' => 'General Medicine field',
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Field created successfully',
            ]);

        $this->assertDatabaseHas('fields', [
            'name' => 'General Medicine',
            'description' => 'General Medicine field',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_duplicate_field(): void
    {
        Field::create(['name' => 'General Medicine']);

        $this->json('POST', '/api/v1/fields', [
            'name' => 'General Medicine',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_field(): void
    {
        $field = Field::create(['name' => 'Cardiology']);

        $response = $this->json('GET', "/api/v1/fields/{$field->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Field retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Cardiology');
    }

    public function test_returns_404_for_nonexistent_field(): void
    {
        $this->json('GET', '/api/v1/fields/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_field(): void
    {
        $field = Field::create(['name' => 'Old Name']);

        $response = $this->json('PUT', "/api/v1/fields/{$field->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated description',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Field updated successfully',
            ]);

        $this->assertDatabaseHas('fields', [
            'id' => $field->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_delete_field(): void
    {
        $field = Field::create(['name' => 'To Delete']);

        $response = $this->json('DELETE', "/api/v1/fields/{$field->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Field deleted successfully',
            ]);

        $this->assertSoftDeleted('fields', ['id' => $field->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/fields')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/fields', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
