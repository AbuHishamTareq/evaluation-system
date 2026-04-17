<?php

namespace Tests\Unit\Services;

use App\Models\PhcCenter;
use App\Models\StaffProfile;
use App\Models\Tenant;
use App\Models\User;
use App\Repositories\Interfaces\StaffProfileRepositoryInterface;
use App\Services\HR\StaffProfileService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffProfileServiceTest extends TestCase
{
    use RefreshDatabase;

    private StaffProfileService $service;

    private PhcCenter $center;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::factory()->create();
        $this->center = PhcCenter::factory()->for($tenant)->create();

        $this->service = new StaffProfileService(
            $this->app->make(StaffProfileRepositoryInterface::class)
        );
    }

    public function test_can_get_all_staff_profiles(): void
    {
        $profiles = StaffProfile::factory()->count(3)->for($this->center)->create();

        $result = $this->service->getAll();

        $this->assertCount(3, $result);
    }

    public function test_can_get_staff_profile_by_id(): void
    {
        $profile = StaffProfile::factory()->for($this->center)->create();

        $result = $this->service->getById($profile->id);

        $this->assertEquals($profile->id, $result->id);
    }

    public function test_can_create_staff_profile(): void
    {
        $user = User::factory()->create();
        $data = [
            'user_id' => $user->id,
            'phc_center_id' => $this->center->id,
            'employee_id' => 'EMP001',
            'first_name' => 'John',
            'last_name' => 'Doe',
        ];

        $result = $this->service->create($data);

        $this->assertInstanceOf(StaffProfile::class, $result);
        $this->assertEquals('EMP001', $result->employee_id);
    }

    public function test_can_update_staff_profile(): void
    {
        $profile = StaffProfile::factory()->for($this->center)->create(['first_name' => 'John']);

        $result = $this->service->update($profile, ['first_name' => 'Jane']);

        $this->assertEquals('Jane', $result->first_name);
    }

    public function test_can_delete_staff_profile(): void
    {
        $profile = StaffProfile::factory()->for($this->center)->create();

        $result = $this->service->delete($profile);

        $this->assertTrue($result);
        $this->assertSoftDeleted($profile);
    }

    public function test_can_search_staff(): void
    {
        StaffProfile::factory()->for($this->center)->create(['first_name' => 'Ahmed']);
        StaffProfile::factory()->for($this->center)->create(['first_name' => 'Sarah']);

        $result = $this->service->search('Ahmed');

        $this->assertCount(1, $result);
    }
}
