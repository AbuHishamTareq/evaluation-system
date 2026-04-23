<?php

namespace Tests\Feature;

use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StaffProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_profiles_index_returns_correct_structure(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        StaffProfile::factory()->count(3)->create(['employment_status' => 'active']);

        $response = $this->getJson('/api/v1/staff-profiles?per_page=2');

        $response->assertStatus(200);

        $data = $response->json();

        $this->assertArrayHasKey('data', $data);
        $this->assertArrayHasKey('meta', $data);

        $this->assertNotEmpty($data['data']);

        $first = $data['data'][0];
        $this->assertArrayHasKey('id', $first);
        $this->assertArrayHasKey('first_name', $first);
        $this->assertArrayHasKey('last_name', $first);
        $this->assertArrayHasKey('employment_status', $first);
        $this->assertEquals('active', $first['employment_status']);
    }
}
