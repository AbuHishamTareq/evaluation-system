<?php

namespace Tests\Feature\ClinicAssignments;

use App\Models\ClinicAssignment;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClinicAssignmentControllerTest extends TestCase
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

    public function test_can_list_clinic_assignments(): void
    {
        ClinicAssignment::create([
            'name' => 'General Clinic',
            'description' => 'General medical clinic',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/clinic-assignments', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_clinic_assignment(): void
    {
        $response = $this->json('POST', '/api/v1/clinic-assignments', [
            'name' => 'Dental Clinic',
            'description' => 'Dental care clinic',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Clinic assignment created successfully',
            ]);

        $this->assertDatabaseHas('clinic_assignments', [
            'name' => 'Dental Clinic',
        ]);
    }

    public function test_cannot_create_clinic_assignment_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/clinic-assignments', [
            'name' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_clinic_assignment_name(): void
    {
        ClinicAssignment::create([
            'name' => 'Maternity Clinic',
            'is_active' => true,
        ]);

        $response = $this->json('POST', '/api/v1/clinic-assignments', [
            'name' => 'Maternity Clinic',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_clinic_assignment(): void
    {
        $assignment = ClinicAssignment::create([
            'name' => 'Eye Clinic',
            'description' => 'Ophthalmology clinic',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/clinic-assignments/'.$assignment->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Clinic assignment retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Eye Clinic');
    }

    public function test_returns_404_for_nonexistent_clinic_assignment(): void
    {
        $response = $this->json('GET', '/api/v1/clinic-assignments/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_clinic_assignment(): void
    {
        $assignment = ClinicAssignment::create([
            'name' => 'ENT Clinic',
            'description' => 'Ear, nose, throat clinic',
            'is_active' => true,
        ]);

        $response = $this->json('PUT', '/api/v1/clinic-assignments/'.$assignment->id, [
            'name' => 'ENT Specialist Clinic',
            'description' => 'Advanced ENT care',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Clinic assignment updated successfully',
            ]);

        $this->assertDatabaseHas('clinic_assignments', [
            'id' => $assignment->id,
            'name' => 'ENT Specialist Clinic',
        ]);
    }

    public function test_can_delete_clinic_assignment(): void
    {
        $assignment = ClinicAssignment::create([
            'name' => 'Temp Clinic',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', '/api/v1/clinic-assignments/'.$assignment->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Clinic assignment deleted successfully',
            ]);

        $this->assertSoftDeleted('clinic_assignments', ['id' => $assignment->id]);
    }

    public function test_can_toggle_clinic_assignment_status(): void
    {
        $assignment = ClinicAssignment::create([
            'name' => 'Togglable Clinic',
            'is_active' => true,
        ]);

        $response = $this->json('PATCH', '/api/v1/clinic-assignments/'.$assignment->id.'/toggle-status', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Clinic assignment status toggled successfully',
            ]);

        $this->assertDatabaseHas('clinic_assignments', [
            'id' => $assignment->id,
            'is_active' => false,
        ]);
    }
}
