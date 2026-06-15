<?php

namespace Tests\Feature\Evaluations;

use App\Features\Evaluations\Repositories\EloquentEvaluationRepository;
use App\Features\Evaluations\Repositories\EvaluationRepositoryInterface;
use App\Models\Evaluation;
use App\Models\EvaluationTemplate;
use App\Models\PhcCenter;
use App\Models\Role;
use App\Models\User;
use App\Models\Zone;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected EvaluationTemplate $template;

    protected PhcCenter $center;

    protected User $evaluator;

    protected function setUp(): void
    {
        parent::setUp();

        // Bind the Evaluation repository
        $this->app->bind(
            EvaluationRepositoryInterface::class,
            EloquentEvaluationRepository::class
        );

        $this->seed(DatabaseSeeder::class);
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->user = User::factory()->create();
        $role = Role::where('name', 'Super Admin')->first();
        $this->user->roles()->sync([$role->id]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
        $this->headers = ['Authorization' => 'Bearer '.$this->token];

        $this->template = EvaluationTemplate::create([
            'name' => 'Annual Review',
            'schedule_type' => 'quarterly',
            'total_score' => 100,
        ]);

        $zone = Zone::first();
        $this->center = PhcCenter::create([
            'name' => 'Test Center',
            'code' => 'TC001',
            'zone_id' => $zone->id,
        ]);

        $this->evaluator = User::factory()->create();
    }

    public function test_can_list_evaluations(): void
    {
        Evaluation::create([
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
        ]);

        $response = $this->json('GET', '/api/v1/evaluations', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'template_id', 'phc_center_id', 'evaluator_id', 'status', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_evaluation(): void
    {
        $response = $this->json('POST', '/api/v1/evaluations', [
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
            'notes' => 'Initial evaluation',
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation created successfully',
            ]);

        $this->assertDatabaseHas('evaluations', [
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
        ]);
    }

    public function test_cannot_create_evaluation_without_required_fields(): void
    {
        $this->json('POST', '/api/v1/evaluations', [], $this->headers)
            ->assertStatus(422);
    }

    public function test_can_show_evaluation(): void
    {
        $evaluation = Evaluation::create([
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
        ]);

        $response = $this->json('GET', "/api/v1/evaluations/{$evaluation->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation retrieved successfully',
            ]);
    }

    public function test_returns_404_for_nonexistent_evaluation(): void
    {
        $this->json('GET', '/api/v1/evaluations/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_evaluation(): void
    {
        $evaluation = Evaluation::create([
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
            'notes' => 'Old notes',
        ]);

        $response = $this->json('PUT', "/api/v1/evaluations/{$evaluation->id}", [
            'notes' => 'Updated notes',
            'status' => 'in_progress',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation updated successfully',
            ]);

        $this->assertDatabaseHas('evaluations', [
            'id' => $evaluation->id,
            'notes' => 'Updated notes',
            'status' => 'in_progress',
        ]);
    }

    public function test_can_submit_evaluation(): void
    {
        $evaluation = Evaluation::create([
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
        ]);

        $response = $this->json('POST', "/api/v1/evaluations/{$evaluation->id}/submit", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation submitted successfully',
            ]);
    }

    public function test_can_approve_evaluation(): void
    {
        $evaluation = Evaluation::create([
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'completed',
        ]);

        $response = $this->json('POST', "/api/v1/evaluations/{$evaluation->id}/approve", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation approved successfully',
            ]);
    }

    public function test_can_delete_evaluation(): void
    {
        $evaluation = Evaluation::create([
            'template_id' => $this->template->id,
            'phc_center_id' => $this->center->id,
            'evaluator_id' => $this->evaluator->id,
            'status' => 'draft',
        ]);

        $response = $this->json('DELETE', "/api/v1/evaluations/{$evaluation->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Evaluation deleted successfully',
            ]);

        $this->assertSoftDeleted('evaluations', ['id' => $evaluation->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/evaluations')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/evaluations', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
