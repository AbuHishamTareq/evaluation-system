<?php

namespace Tests\Feature\Professionals;

use App\Models\Professional;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfessionalControllerTest extends TestCase
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

    public function test_can_list_professionals(): void
    {
        Professional::create([
            'name' => 'Senior Nurse',
            'description' => 'Senior nursing professional',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/professionals', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_professional(): void
    {
        $response = $this->json('POST', '/api/v1/professionals', [
            'name' => 'Lab Technician',
            'description' => 'Laboratory technician',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Professional created successfully',
            ]);

        $this->assertDatabaseHas('professionals', [
            'name' => 'Lab Technician',
        ]);
    }

    public function test_cannot_create_professional_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/professionals', [
            'name' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_professional_name(): void
    {
        Professional::create([
            'name' => 'Pharmacist',
            'is_active' => true,
        ]);

        $response = $this->json('POST', '/api/v1/professionals', [
            'name' => 'Pharmacist',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_professional(): void
    {
        $professional = Professional::create([
            'name' => 'Radiologist',
            'description' => 'X-ray specialist',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/professionals/'.$professional->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professional retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Radiologist');
    }

    public function test_returns_404_for_nonexistent_professional(): void
    {
        $response = $this->json('GET', '/api/v1/professionals/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_professional(): void
    {
        $professional = Professional::create([
            'name' => 'Dentist',
            'description' => 'Dental care',
            'is_active' => true,
        ]);

        $response = $this->json('PUT', '/api/v1/professionals/'.$professional->id, [
            'name' => 'Senior Dentist',
            'description' => 'Advanced dental care',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professional updated successfully',
            ]);

        $this->assertDatabaseHas('professionals', [
            'id' => $professional->id,
            'name' => 'Senior Dentist',
        ]);
    }

    public function test_can_delete_professional(): void
    {
        $professional = Professional::create([
            'name' => 'Temp Professional',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', '/api/v1/professionals/'.$professional->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professional deleted successfully',
            ]);

        $this->assertSoftDeleted('professionals', ['id' => $professional->id]);
    }

    public function test_can_toggle_professional_status(): void
    {
        $professional = Professional::create([
            'name' => 'Togglable Professional',
            'is_active' => true,
        ]);

        $response = $this->json('PATCH', '/api/v1/professionals/'.$professional->id.'/toggle-status', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Professional status toggled successfully',
            ]);

        $this->assertDatabaseHas('professionals', [
            'id' => $professional->id,
            'is_active' => false,
        ]);
    }
}
