<?php

namespace Tests\Feature\ActionPlans;

use App\Features\ActionPlans\Repositories\ActionPlanRepositoryInterface;
use App\Features\ActionPlans\Repositories\EloquentActionPlanRepository;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActionPlanControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        // Bind the ActionPlan repository interface to the Eloquent implementation
        $this->app->bind(
            ActionPlanRepositoryInterface::class,
            EloquentActionPlanRepository::class
        );

        $this->seed(DatabaseSeeder::class);
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $role = Role::where('name', 'Super Admin')->first();
        $this->user->roles()->sync([$role->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->headers = ['Authorization' => 'Bearer '.$this->token];
    }

    public function test_cannot_create_action_plan_without_required_fields(): void
    {
        $this->json('POST', '/api/v1/action-plans', [], $this->headers)
            ->assertStatus(422);
    }

    public function test_returns_404_for_nonexistent_action_plan(): void
    {
        $this->json('GET', '/api/v1/action-plans/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/action-plans')->assertStatus(401);
    }
}
