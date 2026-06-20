<?php

namespace Tests\Feature\Templates;

use App\Models\EvaluationTemplate;
use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TemplateControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected QuestionCategory $category;

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

        $this->category = QuestionCategory::create([
            'name' => 'General',
            'code' => 'GEN',
            'description' => 'General questions',
            'order' => 1,
            'is_active' => true,
        ]);
    }

    protected function createQuestion(string $text = 'Sample question'): Question
    {
        return Question::create([
            'category_id' => $this->category->id,
            'question_text' => $text,
            'question_type' => 'text',
            'is_active' => true,
        ]);
    }

    public function test_can_list_templates(): void
    {
        EvaluationTemplate::create([
            'name' => 'Annual Review',
            'description' => 'Annual performance review',
            'schedule_type' => 'quarterly',
            'total_score' => 100,
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/templates', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'description', 'schedule_type', 'total_score', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_template(): void
    {
        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Monthly Review',
            'description' => 'Monthly performance review',
            'schedule_type' => 'monthly',
            'total_score' => 50,
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Template created successfully',
            ]);

        $this->assertDatabaseHas('evaluation_templates', [
            'name' => 'Monthly Review',
            'schedule_type' => 'monthly',
        ]);
    }

    public function test_cannot_create_template_without_name(): void
    {
        $this->json('POST', '/api/v1/templates', [
            'schedule_type' => 'monthly',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_template(): void
    {
        $template = EvaluationTemplate::create([
            'name' => 'Quarterly Review',
            'schedule_type' => 'quarterly',
            'total_score' => 75,
        ]);

        $response = $this->json('GET', "/api/v1/templates/{$template->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Template retrieved successfully',
            ])
            ->assertJsonPath('data.name', 'Quarterly Review');
    }

    public function test_returns_404_for_nonexistent_template(): void
    {
        $this->json('GET', '/api/v1/templates/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_template(): void
    {
        $template = EvaluationTemplate::create([
            'name' => 'Old Template',
            'schedule_type' => 'one_time',
        ]);

        $response = $this->json('PUT', "/api/v1/templates/{$template->id}", [
            'name' => 'Updated Template',
            'total_score' => 100,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Template updated successfully',
            ]);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $template->id,
            'name' => 'Updated Template',
        ]);
    }

    public function test_can_toggle_template_status(): void
    {
        $template = EvaluationTemplate::create([
            'name' => 'Toggle Test',
            'schedule_type' => 'one_time',
            'is_active' => true,
        ]);

        $response = $this->json('PATCH', "/api/v1/templates/{$template->id}/toggle-status", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Template status updated successfully',
            ]);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $template->id,
            'is_active' => false,
        ]);
    }

    public function test_can_delete_template(): void
    {
        $template = EvaluationTemplate::create([
            'name' => 'To Delete',
            'schedule_type' => 'one_time',
        ]);

        $response = $this->json('DELETE', "/api/v1/templates/{$template->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Template deleted successfully',
            ]);

        $this->assertSoftDeleted('evaluation_templates', ['id' => $template->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/templates')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/templates', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }

    public function test_can_create_template_with_questions(): void
    {
        $question1 = $this->createQuestion('Question 1');
        $question2 = $this->createQuestion('Question 2');

        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Checklist Evaluation',
            'description' => 'A checklist-style evaluation',
            'schedule_type' => 'monthly',
            'type' => 'checklist',
            'total_score' => 100,
            'is_active' => true,
            'questions' => [
                ['question_id' => $question1->id, 'weight' => 3],
                ['question_id' => $question2->id, 'weight' => 2],
            ],
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Template created successfully',
            ]);

        $templateId = $response->json('data.id');

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $templateId,
            'name' => 'Checklist Evaluation',
            'type' => 'checklist',
            'total_score' => 100,
        ]);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $templateId,
            'question_id' => $question1->id,
            'weight' => 3,
            'order' => 1,
        ]);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $templateId,
            'question_id' => $question2->id,
            'weight' => 2,
            'order' => 2,
        ]);
    }

    public function test_auto_calculates_total_score_from_question_weights(): void
    {
        $question1 = $this->createQuestion('Question 1');
        $question2 = $this->createQuestion('Question 2');
        $question3 = $this->createQuestion('Question 3');

        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Auto Score Template',
            'description' => 'Total score should auto-calculate',
            'schedule_type' => 'quarterly',
            'is_active' => true,
            'questions' => [
                ['question_id' => $question1->id, 'weight' => 5],
                ['question_id' => $question2->id, 'weight' => 10],
                ['question_id' => $question3->id, 'weight' => 15],
            ],
        ], $this->headers);

        $response->assertStatus(201);

        // total_score should be 5 + 10 + 15 = 30
        $this->assertEquals(30, $response->json('data.total_score'));

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $response->json('data.id'),
            'total_score' => 30,
        ]);
    }

    public function test_auto_calculates_total_score_with_default_weights(): void
    {
        $question1 = $this->createQuestion('Question A');
        $question2 = $this->createQuestion('Question B');

        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Default Weights Template',
            'description' => 'Weights default to 1',
            'schedule_type' => 'monthly',
            'is_active' => true,
            'questions' => [
                ['question_id' => $question1->id],
                ['question_id' => $question2->id],
            ],
        ], $this->headers);

        $response->assertStatus(201);

        // total_score should be 1 + 1 = 2 (default weights)
        $this->assertEquals(2, $response->json('data.total_score'));

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $response->json('data.id'),
            'total_score' => 2,
        ]);
    }

    public function test_explicit_total_score_overrides_auto_calculation(): void
    {
        $question1 = $this->createQuestion('Question X');
        $question2 = $this->createQuestion('Question Y');

        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Explicit Score Template',
            'description' => 'Total score explicitly set',
            'schedule_type' => 'quarterly',
            'total_score' => 200,
            'is_active' => true,
            'questions' => [
                ['question_id' => $question1->id, 'weight' => 5],
                ['question_id' => $question2->id, 'weight' => 10],
            ],
        ], $this->headers);

        $response->assertStatus(201);

        // Should use explicit 200, not auto-calculated 15
        $this->assertEquals(200, $response->json('data.total_score'));

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $response->json('data.id'),
            'total_score' => 200,
        ]);
    }

    public function test_can_create_template_with_custom_question_ordering(): void
    {
        $question1 = $this->createQuestion('First');
        $question2 = $this->createQuestion('Second');
        $question3 = $this->createQuestion('Third');

        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Custom Order Template',
            'description' => 'Questions with custom order values',
            'schedule_type' => 'monthly',
            'total_score' => 50,
            'is_active' => true,
            'questions' => [
                ['question_id' => $question3->id, 'weight' => 1, 'order' => 3],
                ['question_id' => $question1->id, 'weight' => 1, 'order' => 1],
                ['question_id' => $question2->id, 'weight' => 1, 'order' => 2],
            ],
        ], $this->headers);

        $response->assertStatus(201);

        $templateId = $response->json('data.id');

        // Verify the custom order was preserved
        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $templateId,
            'question_id' => $question3->id,
            'order' => 3,
        ]);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $templateId,
            'question_id' => $question1->id,
            'order' => 1,
        ]);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $templateId,
            'question_id' => $question2->id,
            'order' => 2,
        ]);
    }

    public function test_update_template_replaces_questions(): void
    {
        $question1 = $this->createQuestion('Original Q1');
        $question2 = $this->createQuestion('Original Q2');

        $template = EvaluationTemplate::create([
            'name' => 'Original Template',
            'description' => 'Template with original questions',
            'schedule_type' => 'monthly',
            'total_score' => 50,
            'is_active' => true,
        ]);

        $template->questions()->createMany([
            ['question_id' => $question1->id, 'order' => 1, 'weight' => 5],
            ['question_id' => $question2->id, 'order' => 2, 'weight' => 5],
        ]);

        $question3 = $this->createQuestion('Replacement Q3');
        $question4 = $this->createQuestion('Replacement Q4');

        $response = $this->json('PUT', "/api/v1/templates/{$template->id}", [
            'name' => 'Updated Template',
            'questions' => [
                ['question_id' => $question3->id, 'weight' => 10],
                ['question_id' => $question4->id, 'weight' => 20],
            ],
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Template updated successfully',
            ]);

        // Old questions should be gone
        $this->assertDatabaseMissing('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question1->id,
        ]);

        $this->assertDatabaseMissing('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question2->id,
        ]);

        // New questions should be present
        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question3->id,
            'weight' => 10,
        ]);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question4->id,
            'weight' => 20,
        ]);

        // total_score should be auto-calculated from new question weights (10 + 20 = 30)
        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $template->id,
            'name' => 'Updated Template',
            'total_score' => 30,
        ]);
    }

    public function test_update_template_without_questions_keeps_existing_questions(): void
    {
        $question1 = $this->createQuestion('Persistent Q1');

        $template = EvaluationTemplate::create([
            'name' => 'Persistent Template',
            'schedule_type' => 'monthly',
            'total_score' => 10,
            'is_active' => true,
        ]);

        $template->questions()->create([
            'question_id' => $question1->id,
            'order' => 1,
            'weight' => 10,
        ]);

        // Update only the name, no questions key
        $response = $this->json('PUT', "/api/v1/templates/{$template->id}", [
            'name' => 'Renamed Template',
        ], $this->headers);

        $response->assertStatus(200);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $template->id,
            'name' => 'Renamed Template',
        ]);

        // Existing question should still be there
        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question1->id,
        ]);
    }

    public function test_toggle_status_toggles_back_and_forth(): void
    {
        $template = EvaluationTemplate::create([
            'name' => 'Toggle Test 2',
            'schedule_type' => 'one_time',
            'is_active' => false,
        ]);

        // Toggle to active
        $this->json('PATCH', "/api/v1/templates/{$template->id}/toggle-status", [], $this->headers)
            ->assertStatus(200);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $template->id,
            'is_active' => true,
        ]);

        // Toggle back to inactive
        $this->json('PATCH', "/api/v1/templates/{$template->id}/toggle-status", [], $this->headers)
            ->assertStatus(200);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $template->id,
            'is_active' => false,
        ]);
    }

    public function test_can_create_template_with_type(): void
    {
        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Audit Evaluation',
            'description' => 'An audit-style evaluation',
            'type' => 'audit',
            'schedule_type' => 'quarterly',
            'total_score' => 80,
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $response->json('data.id'),
            'name' => 'Audit Evaluation',
            'type' => 'audit',
        ]);
    }

    public function test_defaults_type_to_standard(): void
    {
        $response = $this->json('POST', '/api/v1/templates', [
            'name' => 'Default Type Template',
            'description' => 'Should have type = standard',
            'schedule_type' => 'monthly',
            'total_score' => 50,
        ], $this->headers);

        $response->assertStatus(201);

        $this->assertDatabaseHas('evaluation_templates', [
            'id' => $response->json('data.id'),
            'type' => 'standard',
        ]);
    }

    public function test_cannot_create_template_with_invalid_type(): void
    {
        $this->json('POST', '/api/v1/templates', [
            'name' => 'Invalid Type',
            'type' => 'invalid_type',
            'total_score' => 50,
        ], $this->headers)->assertStatus(422);
    }

    public function test_cannot_create_template_with_nonexistent_question_id(): void
    {
        $this->json('POST', '/api/v1/templates', [
            'name' => 'Bad Question Template',
            'description' => 'Has a non-existent question',
            'schedule_type' => 'monthly',
            'total_score' => 50,
            'questions' => [
                ['question_id' => 99999, 'weight' => 5],
            ],
        ], $this->headers)->assertStatus(422);
    }

    public function test_get_active_templates_returns_only_active(): void
    {
        EvaluationTemplate::create([
            'name' => 'Active Template',
            'schedule_type' => 'monthly',
            'total_score' => 50,
            'is_active' => true,
        ]);

        EvaluationTemplate::create([
            'name' => 'Inactive Template',
            'schedule_type' => 'monthly',
            'total_score' => 50,
            'is_active' => false,
        ]);

        $response = $this->json('GET', '/api/v1/templates/active', [], $this->headers);

        $response->assertStatus(200);

        $names = collect($response->json('data'))->pluck('name');

        $this->assertContains('Active Template', $names);
        $this->assertNotContains('Inactive Template', $names);
    }

    public function test_can_update_template_with_custom_question_ordering(): void
    {
        $question1 = $this->createQuestion('Q1');
        $question2 = $this->createQuestion('Q2');

        $template = EvaluationTemplate::create([
            'name' => 'Reorder Template',
            'schedule_type' => 'monthly',
            'total_score' => 10,
            'is_active' => true,
        ]);

        $response = $this->json('PUT', "/api/v1/templates/{$template->id}", [
            'questions' => [
                ['question_id' => $question2->id, 'weight' => 1, 'order' => 5],
                ['question_id' => $question1->id, 'weight' => 1, 'order' => 3],
            ],
        ], $this->headers);

        $response->assertStatus(200);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question2->id,
            'order' => 5,
        ]);

        $this->assertDatabaseHas('evaluation_template_questions', [
            'template_id' => $template->id,
            'question_id' => $question1->id,
            'order' => 3,
        ]);
    }
}
