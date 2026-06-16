<?php

namespace Tests\Feature\Questions;

use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionControllerTest extends TestCase
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

    public function test_can_list_questions(): void
    {
        Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'What is your name?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/questions', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'category_id', 'question_text', 'question_type', 'description', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_question(): void
    {
        $response = $this->json('POST', '/api/v1/questions', [
            'question_text' => 'Describe your experience?',
            'question_type' => 'text',
            'category_id' => $this->category->id,
            'description' => 'Open-ended feedback',
            'weight' => 10,
            'max_score' => 5,
            'is_required' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Question created successfully',
            ]);

        $this->assertDatabaseHas('questions', [
            'question_text' => 'Describe your experience?',
            'question_type' => 'text',
            'category_id' => $this->category->id,
        ]);
    }

    public function test_cannot_create_question_with_invalid_type(): void
    {
        $this->json('POST', '/api/v1/questions', [
            'question_text' => 'Invalid?',
            'question_type' => 'invalid_type',
            'category_id' => $this->category->id,
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_question(): void
    {
        $question = Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'How are you?',
            'question_type' => 'text',
        ]);

        $response = $this->json('GET', "/api/v1/questions/{$question->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question retrieved successfully',
            ])
            ->assertJsonPath('data.question_text', 'How are you?');
    }

    public function test_returns_404_for_nonexistent_question(): void
    {
        $this->json('GET', '/api/v1/questions/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_question(): void
    {
        $question = Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'Old question?',
            'question_type' => 'text',
        ]);

        $response = $this->json('PUT', "/api/v1/questions/{$question->id}", [
            'question_text' => 'Updated question?',
            'weight' => 20,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question updated successfully',
            ]);

        $this->assertDatabaseHas('questions', [
            'id' => $question->id,
            'question_text' => 'Updated question?',
        ]);
    }

    public function test_can_delete_question(): void
    {
        $question = Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'To delete?',
            'question_type' => 'text',
        ]);

        $response = $this->json('DELETE', "/api/v1/questions/{$question->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question deleted successfully',
            ]);

        $this->assertSoftDeleted('questions', ['id' => $question->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/questions')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/questions', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }

    public function test_can_export_questions_as_xlsx(): void
    {
        Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'Export test question?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/questions/export', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('questions.xlsx', $response->headers->get('Content-Disposition'));
    }

    public function test_can_export_questions_as_csv(): void
    {
        Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'CSV export test?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/questions/export/csv', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('questions.csv', $response->headers->get('Content-Disposition'));
    }

    public function test_can_export_questions_as_pdf(): void
    {
        Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'PDF export test?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/questions/export/pdf', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('questions.pdf', $response->headers->get('Content-Disposition'));
    }

    public function test_can_export_questions_defaults_to_xlsx(): void
    {
        Question::create([
            'category_id' => $this->category->id,
            'question_text' => 'Default format test?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('GET', '/api/v1/questions/export/xlsx', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('questions.xlsx', $response->headers->get('Content-Disposition'));
    }
}
