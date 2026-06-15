<?php

namespace Tests\Feature\Staff;

use App\Models\Role;
use App\Models\Staff;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffControllerTest extends TestCase
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

    public function test_can_list_staff(): void
    {
        Staff::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'employee_id' => 'EMP001',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/staff', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_staff(): void
    {
        $response = $this->json('POST', '/api/v1/staff', [
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'employee_id' => 'EMP002',
            'email' => 'jane.smith@example.com',
            'phone' => '0555123456',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Staff created successfully',
            ]);

        $this->assertDatabaseHas('staff', [
            'employee_id' => 'EMP002',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);
    }

    public function test_cannot_create_staff_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/staff', [
            'first_name' => '',
            'last_name' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_staff(): void
    {
        $staff = Staff::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'employee_id' => 'EMP003',
            'email' => 'john.doe@example.com',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/staff/'.$staff->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Staff retrieved successfully',
            ])
            ->assertJsonPath('data.employee_id', 'EMP003');
    }

    public function test_returns_404_for_nonexistent_staff(): void
    {
        $response = $this->json('GET', '/api/v1/staff/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_staff(): void
    {
        $staff = Staff::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'employee_id' => 'EMP004',
            'email' => 'john.doe@example.com',
            'is_active' => true,
        ]);

        $response = $this->json('PUT', '/api/v1/staff/'.$staff->id, [
            'first_name' => 'Johnny',
            'last_name' => 'Doe',
            'email' => 'johnny.doe@example.com',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Staff updated successfully',
            ]);

        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'first_name' => 'Johnny',
        ]);
    }

    public function test_can_delete_staff(): void
    {
        $staff = Staff::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'employee_id' => 'EMP005',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', '/api/v1/staff/'.$staff->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Staff deleted successfully',
            ]);

        $this->assertSoftDeleted('staff', ['id' => $staff->id]);
    }

    public function test_can_toggle_staff_active_status(): void
    {
        $staff = Staff::create([
            'first_name' => 'John',
            'last_name' => 'Doe',
            'employee_id' => 'EMP006',
            'is_active' => true,
        ]);

        // Deactivate
        $response = $this->json('PATCH', '/api/v1/staff/'.$staff->id.'/toggle-active', [
            'deactivation_reason' => 'resigned',
            'deactivation_notes' => 'Employee resigned voluntarily',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Staff deactivated successfully',
            ]);

        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'is_active' => false,
        ]);

        // Reactivate
        $response = $this->json('PATCH', '/api/v1/staff/'.$staff->id.'/toggle-active', [
            'reactivation_notes' => 'Employee rehired',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Staff activated successfully',
            ]);

        $this->assertDatabaseHas('staff', [
            'id' => $staff->id,
            'is_active' => true,
        ]);
    }

    public function test_can_search_staff(): void
    {
        Staff::create([
            'first_name' => 'Searchable',
            'last_name' => 'Person',
            'employee_id' => 'EMP010',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/staff/search?q=Searchable', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Search results retrieved successfully',
            ]);
    }

    public function test_search_requires_minimum_characters(): void
    {
        $response = $this->json('GET', '/api/v1/staff/search?q=a', [], $this->headers);

        $response->assertStatus(400);
    }

    public function test_can_export_staff(): void
    {
        Staff::create([
            'first_name' => 'Export',
            'last_name' => 'User',
            'employee_id' => 'EMP020',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/staff/export', [], $this->headers);

        $response->assertStatus(200);
    }

    public function test_cannot_access_without_permission(): void
    {
        $response = $this->json('GET', '/api/v1/staff');

        $response->assertStatus(401);
    }
}
