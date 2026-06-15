<?php

namespace Tests\Feature\Centers;

use App\Models\PhcCenter;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CenterControllerTest extends TestCase
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

    public function test_can_list_centers(): void
    {
        PhcCenter::create([
            'name' => 'Test Health Center',
            'code' => 'THC001',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/centers', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_center(): void
    {
        $response = $this->json('POST', '/api/v1/centers', [
            'name' => 'New Health Center',
            'code' => 'NHC001',
            'classification' => 'primary',
            'phone' => '0555123456',
            'email' => 'nhc@example.com',
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Center created successfully',
            ]);

        $this->assertDatabaseHas('phc_centers', [
            'code' => 'NHC001',
            'name' => 'New Health Center',
        ]);
    }

    public function test_cannot_create_center_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/centers', [
            'name' => '',
            'code' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_center_code(): void
    {
        PhcCenter::create([
            'name' => 'Existing Center',
            'code' => 'EXIST001',
            'is_active' => true,
        ]);

        $response = $this->json('POST', '/api/v1/centers', [
            'name' => 'Duplicate Code',
            'code' => 'EXIST001',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_center(): void
    {
        $center = PhcCenter::create([
            'name' => 'Detail Center',
            'code' => 'DET001',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/centers/'.$center->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Center retrieved successfully',
            ])
            ->assertJsonPath('data.code', 'DET001');
    }

    public function test_returns_404_for_nonexistent_center(): void
    {
        $response = $this->json('GET', '/api/v1/centers/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_center(): void
    {
        $center = PhcCenter::create([
            'name' => 'Update Center',
            'code' => 'UPD001',
            'is_active' => true,
        ]);

        $response = $this->json('PUT', '/api/v1/centers/'.$center->id, [
            'name' => 'Updated Center Name',
            'classification' => 'secondary',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Center updated successfully',
            ]);

        $this->assertDatabaseHas('phc_centers', [
            'id' => $center->id,
            'name' => 'Updated Center Name',
        ]);
    }

    public function test_can_delete_center(): void
    {
        $center = PhcCenter::create([
            'name' => 'Delete Center',
            'code' => 'DEL001',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', '/api/v1/centers/'.$center->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Center deleted successfully',
            ]);

        $this->assertSoftDeleted('phc_centers', ['id' => $center->id]);
    }

    public function test_can_toggle_center_active_status(): void
    {
        $center = PhcCenter::create([
            'name' => 'Toggle Center',
            'code' => 'TOG001',
            'is_active' => true,
        ]);

        $response = $this->json('PATCH', '/api/v1/centers/'.$center->id.'/status', [
            'is_active' => false,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Center status updated successfully',
            ]);

        $this->assertDatabaseHas('phc_centers', [
            'id' => $center->id,
            'is_active' => false,
        ]);
    }

    public function test_can_export_centers(): void
    {
        PhcCenter::create([
            'name' => 'Export Center',
            'code' => 'EXP001',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/centers/export', [], $this->headers);

        $response->assertStatus(200);
    }

    public function test_permission_enforcement(): void
    {
        // Create a Manager user who does NOT have centers.delete permission
        $managerUser = User::factory()->create(['role' => 'manager']);
        $managerRole = Role::where('name', 'Manager')->first();
        $managerUser->roles()->sync([$managerRole->id]);
        $managerToken = $managerUser->createToken('manager-token')->plainTextToken;
        $managerHeaders = ['Authorization' => 'Bearer '.$managerToken];

        $center = PhcCenter::create([
            'name' => 'Protected Center',
            'code' => 'PRO001',
            'is_active' => true,
        ]);

        // Manager should not be able to delete
        $response = $this->json('DELETE', '/api/v1/centers/'.$center->id, [], $managerHeaders);

        $response->assertStatus(403);
    }
}
