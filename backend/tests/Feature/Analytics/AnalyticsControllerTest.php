<?php

namespace Tests\Feature\Analytics;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $role = Role::where('name', 'Super Admin')->first();
        $this->user->roles()->sync([$role->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->headers = ['Authorization' => 'Bearer '.$this->token];
    }

    public function test_can_get_dashboard_summary(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/dashboard', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Dashboard summary retrieved successfully',
            ]);
    }

    public function test_can_get_evaluation_trends(): void
    {
        $this->markTestSkipped(
            'Requires MySQL: the getEvaluationTrends query uses MySQL-specific DATE_FORMAT function'
        );
    }

    public function test_evaluation_trends_validates_period(): void
    {
        $this->markTestSkipped(
            'Requires MySQL: the getEvaluationTrends query uses MySQL-specific DATE_FORMAT function'
        );
    }

    public function test_can_get_top_performers(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/top-performers', [
            'limit' => 5,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Top performers retrieved successfully',
            ]);
    }

    public function test_can_get_center_performance(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/center-performance', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Center performance retrieved successfully',
            ]);
    }

    public function test_can_get_question_analytics(): void
    {
        $this->markTestSkipped(
            'Requires MySQL: the getQuestionAnalytics query uses MySQL-specific DATE_FORMAT function'
        );
    }

    public function test_can_get_action_plan_statistics(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/action-plan-statistics', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Action plan statistics retrieved successfully',
            ]);
    }

    public function test_can_get_score_distribution(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/score-distribution', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Score distribution retrieved successfully',
            ]);
    }

    public function test_can_get_zone_analytics(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/zone-analytics', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Zone analytics retrieved successfully',
            ]);
    }

    public function test_can_get_classification_breakdown(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/classification-breakdown', [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Classification breakdown retrieved successfully',
            ]);
    }

    public function test_can_get_recent_activity(): void
    {
        $response = $this->json('GET', '/api/v1/analytics/recent-activity', [
            'limit' => 5,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Recent activity retrieved successfully',
            ]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/analytics/dashboard')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/analytics/dashboard', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
