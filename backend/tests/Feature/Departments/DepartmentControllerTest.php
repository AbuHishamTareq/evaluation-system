<?php

namespace Tests\Feature\Departments;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentControllerTest extends TestCase
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

    public function test_can_list_departments(): void
    {
        Department::create([
            'name' => 'Cardiology',
            'description' => 'Heart department',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/departments', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_department(): void
    {
        $response = $this->json('POST', '/api/v1/departments', [
            'name' => 'Pediatrics',
            'description' => 'Child healthcare department',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Department created successfully',
            ]);

        $this->assertDatabaseHas('departments', [
            'name' => 'Pediatrics',
            'description' => 'Child healthcare department',
        ]);
    }

    public function test_cannot_create_department_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/departments', [
            'name' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_department_name(): void
    {
        Department::create([
            'name' => 'Cardiology',
            'is_active' => true,
        ]);

        $response = $this->json('POST', '/api/v1/departments', [
            'name' => 'Cardiology',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_department(): void
    {
        $department = Department::create([
            'name' => 'Orthopedics',
            'description' => 'Bone and joint department',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/departments/'.$department->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Department retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Orthopedics');
    }

    public function test_returns_404_for_nonexistent_department(): void
    {
        $response = $this->json('GET', '/api/v1/departments/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_department(): void
    {
        $department = Department::create([
            'name' => 'Neurology',
            'description' => 'Nerve department',
            'is_active' => true,
        ]);

        $response = $this->json('PUT', '/api/v1/departments/'.$department->id, [
            'name' => 'Advanced Neurology',
            'description' => 'Advanced nerve care department',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Department updated successfully',
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'name' => 'Advanced Neurology',
        ]);
    }

    public function test_can_delete_department(): void
    {
        $department = Department::create([
            'name' => 'Temporary Department',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', '/api/v1/departments/'.$department->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Department deleted successfully',
            ]);
    }

    public function test_can_toggle_department_status(): void
    {
        $department = Department::create([
            'name' => 'Togglable Dept',
            'is_active' => true,
        ]);

        $response = $this->json('PATCH', '/api/v1/departments/'.$department->id.'/toggle-status', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Department status toggled successfully',
            ]);

        $this->assertDatabaseHas('departments', [
            'id' => $department->id,
            'is_active' => false,
        ]);
    }
}
