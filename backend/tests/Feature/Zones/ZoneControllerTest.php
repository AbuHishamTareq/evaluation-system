<?php

namespace Tests\Feature\Zones;

use App\Models\Role;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ZoneControllerTest extends TestCase
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

    public function test_can_list_zones(): void
    {
        Zone::create([
            'name' => 'Test Region',
            'code' => 'TR001',
            'level' => 'region',
        ]);

        $response = $this->json('GET', '/api/v1/zones', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data',
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_zone(): void
    {
        $response = $this->json('POST', '/api/v1/zones', [
            'name' => 'Central Region',
            'code' => 'CR001',
            'level' => 'region',
            'description' => 'Central administrative region',
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Zone created successfully',
            ]);

        $this->assertDatabaseHas('zones', [
            'code' => 'CR001',
            'name' => 'Central Region',
        ]);
    }

    public function test_cannot_create_zone_without_required_fields(): void
    {
        $response = $this->json('POST', '/api/v1/zones', [
            'name' => '',
            'code' => '',
            'level' => '',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_cannot_create_duplicate_zone_code(): void
    {
        Zone::create([
            'name' => 'Existing Zone',
            'code' => 'EXIST001',
            'level' => 'region',
        ]);

        $response = $this->json('POST', '/api/v1/zones', [
            'name' => 'Duplicate Zone',
            'code' => 'EXIST001',
            'level' => 'region',
        ], $this->headers);

        $response->assertStatus(422);
    }

    public function test_can_show_zone(): void
    {
        $zone = Zone::create([
            'name' => 'Detail Zone',
            'code' => 'DET001',
            'level' => 'district',
        ]);

        $response = $this->json('GET', '/api/v1/zones/'.$zone->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Zone retrieved successfully',
            ])
            ->assertJsonPath('data.code', 'DET001');
    }

    public function test_returns_404_for_nonexistent_zone(): void
    {
        $response = $this->json('GET', '/api/v1/zones/99999', [], $this->headers);

        $response->assertStatus(404);
    }

    public function test_can_update_zone(): void
    {
        $zone = Zone::create([
            'name' => 'Update Zone',
            'code' => 'UPD001',
            'level' => 'region',
        ]);

        $response = $this->json('PUT', '/api/v1/zones/'.$zone->id, [
            'name' => 'Updated Zone Name',
            'description' => 'Updated description',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Zone updated successfully',
            ]);

        $this->assertDatabaseHas('zones', [
            'id' => $zone->id,
            'name' => 'Updated Zone Name',
        ]);
    }

    public function test_can_delete_zone(): void
    {
        $zone = Zone::create([
            'name' => 'Delete Zone',
            'code' => 'DEL001',
            'level' => 'region',
        ]);

        $response = $this->json('DELETE', '/api/v1/zones/'.$zone->id, [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Zone deleted successfully',
            ]);

        $this->assertSoftDeleted('zones', ['id' => $zone->id]);
    }
}
