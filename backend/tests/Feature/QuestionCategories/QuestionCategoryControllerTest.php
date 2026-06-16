<?php

namespace Tests\Feature\QuestionCategories;

use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class QuestionCategoryControllerTest extends TestCase
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

    // ----- Permission / Auth checks -----

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/question-categories')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/question-categories', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }

    // ----- CRUD: List -----

    public function test_can_list_question_categories(): void
    {
        QuestionCategory::create(['name' => 'Cat A', 'code' => 'CA', 'order' => 1]);
        QuestionCategory::create(['name' => 'Cat B', 'code' => 'CB', 'order' => 2]);

        $response = $this->json('GET', '/api/v1/question-categories', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'code', 'description', 'order', 'is_active', 'questions_count', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_filter_question_categories_by_search(): void
    {
        QuestionCategory::create(['name' => 'ZZZ Uniquely Searchable', 'code' => 'ZUS', 'order' => 1]);
        QuestionCategory::create(['name' => 'Other Category', 'code' => 'OTH', 'order' => 2]);

        $response = $this->json('GET', '/api/v1/question-categories', ['search' => 'Uniquely'], $this->headers);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_can_filter_question_categories_by_is_active(): void
    {
        QuestionCategory::create(['name' => 'Inactive Cat', 'code' => 'ICAT', 'order' => 100, 'is_active' => false]);

        $response = $this->json('GET', '/api/v1/question-categories', ['is_active' => 'false'], $this->headers);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $item) {
            $this->assertFalse($item['is_active']);
        }
    }

    // ----- CRUD: Create -----

    public function test_can_create_question_category(): void
    {
        $response = $this->json('POST', '/api/v1/question-categories', [
            'name' => 'Test Category',
            'code' => 'TEST',
            'description' => 'A test category',
            'order' => 5,
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Question category created successfully',
            ]);

        $this->assertDatabaseHas('question_categories', [
            'code' => 'TEST',
            'name' => 'Test Category',
            'order' => 5,
            'is_active' => true,
        ]);
    }

    public function test_requires_name_and_code_on_create(): void
    {
        $response = $this->json('POST', '/api/v1/question-categories', [], $this->headers);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code']);
    }

    public function test_cannot_create_duplicate_code(): void
    {
        QuestionCategory::create(['name' => 'Existing', 'code' => 'DUPE', 'order' => 1]);

        $this->json('POST', '/api/v1/question-categories', [
            'name' => 'Duplicate',
            'code' => 'DUPE',
        ], $this->headers)->assertStatus(422);
    }

    // ----- CRUD: Show -----

    public function test_can_show_question_category(): void
    {
        $category = QuestionCategory::create(['name' => 'Show Cat', 'code' => 'SHOW', 'order' => 1]);

        $response = $this->json('GET', "/api/v1/question-categories/{$category->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question category retrieved successfully',
            ])
            ->assertJsonPath('data.code', 'SHOW');
    }

    public function test_returns_404_for_nonexistent_question_category(): void
    {
        $this->json('GET', '/api/v1/question-categories/99999', [], $this->headers)
            ->assertStatus(404);
    }

    // ----- CRUD: Update -----

    public function test_can_update_question_category(): void
    {
        $category = QuestionCategory::create(['name' => 'Old Name', 'code' => 'OLD', 'order' => 1]);

        $response = $this->json('PUT', "/api/v1/question-categories/{$category->id}", [
            'name' => 'Updated Name',
            'code' => 'UPD',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question category updated successfully',
            ]);

        $this->assertDatabaseHas('question_categories', [
            'id' => $category->id,
            'code' => 'UPD',
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_update_question_category_with_same_code(): void
    {
        $category = QuestionCategory::create(['name' => 'Test', 'code' => 'SAME', 'order' => 1]);

        $response = $this->json('PUT', "/api/v1/question-categories/{$category->id}", [
            'name' => 'Updated',
            'code' => 'SAME',
        ], $this->headers);

        $response->assertStatus(200);
    }

    // ----- CRUD: Delete -----

    public function test_can_delete_question_category(): void
    {
        $category = QuestionCategory::create(['name' => 'To Delete', 'code' => 'DEL', 'order' => 1]);

        $response = $this->json('DELETE', "/api/v1/question-categories/{$category->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question category deleted successfully',
            ]);

        $this->assertSoftDeleted('question_categories', ['id' => $category->id]);
    }

    public function test_cannot_delete_question_category_with_associated_questions(): void
    {
        $category = QuestionCategory::create(['name' => 'Has Questions', 'code' => 'HASQ', 'order' => 1]);
        Question::create([
            'category_id' => $category->id,
            'question_text' => 'Test question?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', "/api/v1/question-categories/{$category->id}", [], $this->headers);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
            ]);
    }

    // ----- Toggle Status -----

    public function test_can_toggle_question_category_status(): void
    {
        $category = QuestionCategory::create(['name' => 'Toggle Cat', 'code' => 'TOG', 'order' => 1, 'is_active' => true]);

        $response = $this->json('PATCH', "/api/v1/question-categories/{$category->id}/toggle-status", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question category deactivated successfully',
            ]);

        $this->assertDatabaseHas('question_categories', [
            'id' => $category->id,
            'is_active' => false,
        ]);
    }

    public function test_can_toggle_question_category_status_back_to_active(): void
    {
        $category = QuestionCategory::create(['name' => 'Toggle Cat 2', 'code' => 'TOG2', 'order' => 1, 'is_active' => false]);

        $response = $this->json('PATCH', "/api/v1/question-categories/{$category->id}/toggle-status", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question category activated successfully',
            ]);

        $this->assertDatabaseHas('question_categories', [
            'id' => $category->id,
            'is_active' => true,
        ]);
    }

    public function test_toggle_status_returns_404_for_nonexistent(): void
    {
        $this->json('PATCH', '/api/v1/question-categories/99999/toggle-status', [], $this->headers)
            ->assertStatus(404);
    }

    // ----- Active list -----

    public function test_can_list_active_question_categories(): void
    {
        // The seeder already creates active categories; this test verifies only active ones are returned
        QuestionCategory::create(['name' => 'Inactive', 'code' => 'IACT', 'order' => 100, 'is_active' => false]);

        $response = $this->json('GET', '/api/v1/question-categories/active', [], $this->headers);

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $item) {
            $this->assertTrue($item['is_active']);
        }
    }

    // ----- Export -----

    public function test_can_export_question_categories_as_xlsx(): void
    {
        QuestionCategory::create(['name' => 'Export Cat', 'code' => 'EXP', 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-categories/export/xlsx', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('openxmlformats', $response->headers->get('Content-Type'));
    }

    public function test_can_export_question_categories_as_csv(): void
    {
        QuestionCategory::create(['name' => 'CSV Cat', 'code' => 'CSV', 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-categories/export/csv', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    public function test_can_export_question_categories_as_pdf(): void
    {
        QuestionCategory::create(['name' => 'PDF Cat', 'code' => 'PDF', 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-categories/export/pdf', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_export_returns_error_for_invalid_format(): void
    {
        $this->json('GET', '/api/v1/question-categories/export/doc', [], $this->headers)
            ->assertStatus(400);
    }

    // ----- Download Sample -----

    public function test_can_download_sample(): void
    {
        $response = $this->json('GET', '/api/v1/question-categories/sample', [], $this->headers);

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    // ----- Import -----

    public function test_can_import_question_categories(): void
    {
        $content = $this->generateImportCsv();
        $file = UploadedFile::fake()->createWithContent('import.csv', $content);

        $response = $this->json('POST', '/api/v1/question-categories/import', [
            'file' => $file,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('question_categories', ['code' => 'IMP1']);
        $this->assertDatabaseHas('question_categories', ['code' => 'IMP2']);
    }

    public function test_import_requires_valid_file(): void
    {
        $this->json('POST', '/api/v1/question-categories/import', [], $this->headers)
            ->assertStatus(422);
    }

    // ----- Helpers -----

    protected function generateImportCsv(): string
    {
        $lines = [
            'name,code,description,order,is_active',
            'Import Cat 1,IMP1,First imported category,1,true',
            'Import Cat 2,IMP2,Second imported category,2,true',
        ];

        return implode("\n", $lines);
    }
}
