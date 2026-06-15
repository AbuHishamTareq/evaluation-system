<?php

namespace Tests\Feature\Classification;

use App\Models\Field;
use App\Models\Role;
use App\Models\Specialty;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpecialtyControllerTest extends TestCase
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

    public function test_can_list_specialties(): void
    {
        $field = Field::create(['name' => 'Medicine']);
        Specialty::create(['field_id' => $field->id, 'name' => 'Cardiology']);
        Specialty::create(['field_id' => $field->id, 'name' => 'Neurology']);

        $response = $this->json('GET', '/api/v1/specialties', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'field_id', 'name', 'description', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_specialty(): void
    {
        $field = Field::create(['name' => 'Medicine']);

        $response = $this->json('POST', '/api/v1/specialties', [
            'field_id' => $field->id,
            'name' => 'Cardiology',
            'description' => 'Heart diseases',
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Specialty created successfully',
            ]);

        $this->assertDatabaseHas('specialties', [
            'field_id' => $field->id,
            'name' => 'Cardiology',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_specialty_without_field(): void
    {
        $this->json('POST', '/api/v1/specialties', [
            'name' => 'Cardiology',
        ], $this->headers)->assertStatus(422);
    }

    public function test_cannot_create_duplicate_specialty_in_same_field(): void
    {
        $field = Field::create(['name' => 'Medicine']);
        Specialty::create(['field_id' => $field->id, 'name' => 'Cardiology']);

        $this->json('POST', '/api/v1/specialties', [
            'field_id' => $field->id,
            'name' => 'Cardiology',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_specialty(): void
    {
        $field = Field::create(['name' => 'Medicine']);
        $specialty = Specialty::create(['field_id' => $field->id, 'name' => 'Neurology']);

        $response = $this->json('GET', "/api/v1/specialties/{$specialty->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Specialty retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Neurology');
    }

    public function test_returns_404_for_nonexistent_specialty(): void
    {
        $this->json('GET', '/api/v1/specialties/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_specialty(): void
    {
        $field = Field::create(['name' => 'Medicine']);
        $specialty = Specialty::create(['field_id' => $field->id, 'name' => 'Old Specialty']);

        $response = $this->json('PUT', "/api/v1/specialties/{$specialty->id}", [
            'name' => 'Updated Specialty',
            'description' => 'Updated description',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Specialty updated successfully',
            ]);

        $this->assertDatabaseHas('specialties', [
            'id' => $specialty->id,
            'name' => 'Updated Specialty',
        ]);
    }

    public function test_can_delete_specialty(): void
    {
        $field = Field::create(['name' => 'Medicine']);
        $specialty = Specialty::create(['field_id' => $field->id, 'name' => 'To Delete']);

        $response = $this->json('DELETE', "/api/v1/specialties/{$specialty->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Specialty deleted successfully',
            ]);

        $this->assertSoftDeleted('specialties', ['id' => $specialty->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/specialties')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/specialties', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
