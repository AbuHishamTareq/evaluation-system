<?php

namespace Tests\Feature\EducationalDegrees;

use App\Models\EducationalDegree;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EducationalDegreeControllerTest extends TestCase
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

    public function test_can_list_educational_degrees(): void
    {
        EducationalDegree::create([
            'name' => 'Bachelor of Medicine',
            'description' => 'MBBS degree',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/educational-degrees', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_educational_degree(): void
    {
        $response = $this->json('POST', '/api/v1/educational-degrees', [
            'name' => 'Doctor of Pharmacy',
            'description' => 'PharmD degree',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Educational degree created successfully',
            ]);

        $this->assertDatabaseHas('educational_degrees', [
            'name' => 'Doctor of Pharmacy',
        ]);
    }

    public function test_cannot_create_educational_degree_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/educational-degrees', [
            'name' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_educational_degree_name(): void
    {
        EducationalDegree::create([
            'name' => 'Bachelor of Nursing',
            'is_active' => true,
        ]);

        $response = $this->json('POST', '/api/v1/educational-degrees', [
            'name' => 'Bachelor of Nursing',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_educational_degree(): void
    {
        $degree = EducationalDegree::create([
            'name' => 'Master of Public Health',
            'description' => 'MPH degree',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/educational-degrees/'.$degree->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Educational degree retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Master of Public Health');
    }

    public function test_returns_404_for_nonexistent_educational_degree(): void
    {
        $response = $this->json('GET', '/api/v1/educational-degrees/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_educational_degree(): void
    {
        $degree = EducationalDegree::create([
            'name' => 'PhD in Nursing',
            'description' => 'Doctorate in nursing',
            'is_active' => true,
        ]);

        $response = $this->json('PUT', '/api/v1/educational-degrees/'.$degree->id, [
            'name' => 'Doctor of Nursing Practice',
            'description' => 'DNP degree',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Educational degree updated successfully',
            ]);

        $this->assertDatabaseHas('educational_degrees', [
            'id' => $degree->id,
            'name' => 'Doctor of Nursing Practice',
        ]);
    }

    public function test_can_delete_educational_degree(): void
    {
        $degree = EducationalDegree::create([
            'name' => 'Temp Degree',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', '/api/v1/educational-degrees/'.$degree->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Educational degree deleted successfully',
            ]);
    }

    public function test_can_toggle_educational_degree_status(): void
    {
        $degree = EducationalDegree::create([
            'name' => 'Togglable Degree',
            'is_active' => true,
        ]);

        $response = $this->json('PATCH', '/api/v1/educational-degrees/'.$degree->id.'/toggle-status', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Educational degree status toggled successfully',
            ]);

        $this->assertDatabaseHas('educational_degrees', [
            'id' => $degree->id,
            'is_active' => false,
        ]);
    }
}
