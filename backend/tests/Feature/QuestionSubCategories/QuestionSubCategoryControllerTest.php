<?php

namespace Tests\Feature\QuestionSubCategories;

use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\QuestionSubCategory;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class QuestionSubCategoryControllerTest extends TestCase
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

        $this->category = QuestionCategory::create(['name' => 'Test Category', 'code' => 'TCAT', 'order' => 1]);
    }

    // ----- Permission / Auth checks -----

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/question-sub-categories')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/question-sub-categories', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }

    // ----- CRUD: List -----

    public function test_can_list_question_sub_categories(): void
    {
        QuestionSubCategory::create(['name' => 'Sub A', 'code' => 'SUBA', 'question_category_id' => $this->category->id, 'order' => 1]);
        QuestionSubCategory::create(['name' => 'Sub B', 'code' => 'SUBB', 'question_category_id' => $this->category->id, 'order' => 2]);

        $response = $this->json('GET', '/api/v1/question-sub-categories', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'name', 'code', 'description', 'order', 'is_active', 'question_category_id', 'category', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_filter_question_sub_categories_by_search(): void
    {
        QuestionSubCategory::create(['name' => 'ZZZ Uniquely Searchable', 'code' => 'ZUS', 'question_category_id' => $this->category->id, 'order' => 1]);
        QuestionSubCategory::create(['name' => 'Other Sub', 'code' => 'OTH', 'question_category_id' => $this->category->id, 'order' => 2]);

        $response = $this->json('GET', '/api/v1/question-sub-categories', ['search' => 'Uniquely'], $this->headers);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_can_filter_question_sub_categories_by_is_active(): void
    {
        QuestionSubCategory::create(['name' => 'Inactive Sub', 'code' => 'ISUB', 'question_category_id' => $this->category->id, 'order' => 100, 'is_active' => false]);

        $response = $this->json('GET', '/api/v1/question-sub-categories', ['is_active' => 'false'], $this->headers);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $item) {
            $this->assertFalse($item['is_active']);
        }
    }

    public function test_can_filter_question_sub_categories_by_question_category_id(): void
    {
        $otherCategory = QuestionCategory::create(['name' => 'Other Cat', 'code' => 'OCAT', 'order' => 2]);
        QuestionSubCategory::create(['name' => 'Sub In Other', 'code' => 'SIO', 'question_category_id' => $otherCategory->id, 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-sub-categories', ['question_category_id' => $otherCategory->id], $this->headers);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('SIO', $data[0]['code']);
    }

    // ----- CRUD: Create -----

    public function test_can_create_question_sub_category(): void
    {
        $response = $this->json('POST', '/api/v1/question-sub-categories', [
            'question_category_id' => $this->category->id,
            'name' => 'Test Sub Category',
            'code' => 'TSUB',
            'description' => 'A test sub-category',
            'order' => 5,
            'is_active' => true,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Question sub-category created successfully',
            ]);

        $this->assertDatabaseHas('question_sub_categories', [
            'code' => 'TSUB',
            'name' => 'Test Sub Category',
            'question_category_id' => $this->category->id,
            'order' => 5,
            'is_active' => true,
        ]);
    }

    public function test_requires_name_and_code_on_create(): void
    {
        $response = $this->json('POST', '/api/v1/question-sub-categories', [], $this->headers);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'code', 'question_category_id']);
    }

    // ----- CRUD: Show -----

    public function test_can_show_question_sub_category(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'Show Sub', 'code' => 'SHOW', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('GET', "/api/v1/question-sub-categories/{$subCategory->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question sub-category retrieved successfully',
            ])
            ->assertJsonPath('data.code', 'SHOW');
    }

    public function test_returns_404_for_nonexistent_question_sub_category(): void
    {
        $this->json('GET', '/api/v1/question-sub-categories/99999', [], $this->headers)
            ->assertStatus(404);
    }

    // ----- CRUD: Update -----

    public function test_can_update_question_sub_category(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'Old Name', 'code' => 'OLD', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('PUT', "/api/v1/question-sub-categories/{$subCategory->id}", [
            'name' => 'Updated Name',
            'code' => 'UPD',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question sub-category updated successfully',
            ]);

        $this->assertDatabaseHas('question_sub_categories', [
            'id' => $subCategory->id,
            'code' => 'UPD',
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_update_question_sub_category_with_same_code(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'Test', 'code' => 'SAME', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('PUT', "/api/v1/question-sub-categories/{$subCategory->id}", [
            'name' => 'Updated',
            'code' => 'SAME',
        ], $this->headers);

        $response->assertStatus(200);
    }

    // ----- CRUD: Delete -----

    public function test_can_delete_question_sub_category(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'To Delete', 'code' => 'DEL', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('DELETE', "/api/v1/question-sub-categories/{$subCategory->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question sub-category deleted successfully',
            ]);

        $this->assertSoftDeleted('question_sub_categories', ['id' => $subCategory->id]);
    }

    public function test_cannot_delete_question_sub_category_with_associated_questions(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'Has Questions', 'code' => 'HASQ', 'question_category_id' => $this->category->id, 'order' => 1]);
        Question::create([
            'category_id' => $this->category->id,
            'sub_category_id' => $subCategory->id,
            'question_text' => 'Test question?',
            'question_type' => 'text',
            'is_active' => true,
        ]);

        $response = $this->json('DELETE', "/api/v1/question-sub-categories/{$subCategory->id}", [], $this->headers);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
            ]);
    }

    // ----- Toggle Status -----

    public function test_can_toggle_question_sub_category_status(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'Toggle Sub', 'code' => 'TOG', 'question_category_id' => $this->category->id, 'order' => 1, 'is_active' => true]);

        $response = $this->json('PATCH', "/api/v1/question-sub-categories/{$subCategory->id}/toggle-status", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question sub-category deactivated successfully',
            ]);

        $this->assertDatabaseHas('question_sub_categories', [
            'id' => $subCategory->id,
            'is_active' => false,
        ]);
    }

    public function test_can_toggle_question_sub_category_status_back_to_active(): void
    {
        $subCategory = QuestionSubCategory::create(['name' => 'Toggle Sub 2', 'code' => 'TOG2', 'question_category_id' => $this->category->id, 'order' => 1, 'is_active' => false]);

        $response = $this->json('PATCH', "/api/v1/question-sub-categories/{$subCategory->id}/toggle-status", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Question sub-category activated successfully',
            ]);

        $this->assertDatabaseHas('question_sub_categories', [
            'id' => $subCategory->id,
            'is_active' => true,
        ]);
    }

    public function test_toggle_status_returns_404_for_nonexistent(): void
    {
        $this->json('PATCH', '/api/v1/question-sub-categories/99999/toggle-status', [], $this->headers)
            ->assertStatus(404);
    }

    // ----- Active list -----

    public function test_can_list_active_question_sub_categories(): void
    {
        QuestionSubCategory::create(['name' => 'Inactive', 'code' => 'IACT', 'question_category_id' => $this->category->id, 'order' => 100, 'is_active' => false]);

        $response = $this->json('GET', '/api/v1/question-sub-categories/active', [], $this->headers);

        $response->assertStatus(200);

        $data = $response->json('data');
        $this->assertGreaterThanOrEqual(1, count($data));
        foreach ($data as $item) {
            $this->assertTrue($item['is_active']);
        }
    }

    // ----- Export -----

    public function test_can_export_question_sub_categories_as_xlsx(): void
    {
        QuestionSubCategory::create(['name' => 'Export Sub', 'code' => 'EXP', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-sub-categories/export/xlsx', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('openxmlformats', $response->headers->get('Content-Type'));
    }

    public function test_can_export_question_sub_categories_as_csv(): void
    {
        QuestionSubCategory::create(['name' => 'CSV Sub', 'code' => 'CSV', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-sub-categories/export/csv', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
    }

    public function test_can_export_question_sub_categories_as_pdf(): void
    {
        QuestionSubCategory::create(['name' => 'PDF Sub', 'code' => 'PDF', 'question_category_id' => $this->category->id, 'order' => 1]);

        $response = $this->json('GET', '/api/v1/question-sub-categories/export/pdf', [], $this->headers);

        $response->assertStatus(200);
        $this->assertStringContainsString('application/pdf', $response->headers->get('Content-Type'));
    }

    public function test_export_returns_error_for_invalid_format(): void
    {
        $this->json('GET', '/api/v1/question-sub-categories/export/doc', [], $this->headers)
            ->assertStatus(400);
    }

    // ----- Download Sample -----

    public function test_can_download_sample(): void
    {
        $response = $this->json('GET', '/api/v1/question-sub-categories/sample', [], $this->headers);

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    // ----- Import -----

    public function test_can_import_question_sub_categories(): void
    {
        $content = $this->generateImportCsv();
        $file = UploadedFile::fake()->createWithContent('import.csv', $content);

        $response = $this->json('POST', '/api/v1/question-sub-categories/import', [
            'file' => $file,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('question_sub_categories', ['code' => 'IMP1']);
        $this->assertDatabaseHas('question_sub_categories', ['code' => 'IMP2']);
    }

    public function test_import_requires_valid_file(): void
    {
        $this->json('POST', '/api/v1/question-sub-categories/import', [], $this->headers)
            ->assertStatus(422);
    }

    // ----- Helpers -----

    protected function generateImportCsv(): string
    {
        $lines = [
            'name,code,parent_category_code,description,order,is_active',
            'Import Sub 1,IMP1,TCAT,First imported sub-category,1,true',
            'Import Sub 2,IMP2,TCAT,Second imported sub-category,2,true',
        ];

        return implode("\n", $lines);
    }
}
