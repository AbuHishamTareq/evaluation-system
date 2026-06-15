<?php

namespace Tests\Feature\Classification;

use App\Models\Category;
use App\Models\ClassificationMapping;
use App\Models\Field;
use App\Models\Rank;
use App\Models\Role;
use App\Models\Specialty;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassificationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected string $token;

    protected array $headers;

    protected Field $field;

    protected Specialty $specialty;

    protected Rank $rank;

    protected Category $category;

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

        $this->field = Field::create(['name' => 'Medicine']);
        $this->specialty = Specialty::create(['field_id' => $this->field->id, 'name' => 'Cardiology']);
        $this->rank = Rank::create(['name' => 'Consultant', 'level' => 1]);
        $this->category = Category::create(['code' => 'CAT-A', 'name' => 'Category A']);
    }

    public function test_can_list_classifications(): void
    {
        ClassificationMapping::create([
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->json('GET', '/api/v1/classifications', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'field_id', 'specialty_id', 'rank_id', 'category_id', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_classification(): void
    {
        $response = $this->json('POST', '/api/v1/classifications', [
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Classification mapping created successfully',
            ]);

        $this->assertDatabaseHas('classification_mappings', [
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);
    }

    public function test_cannot_create_duplicate_classification(): void
    {
        ClassificationMapping::create([
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);

        $this->json('POST', '/api/v1/classifications', [
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ], $this->headers)->assertStatus(422);
    }

    public function test_cannot_create_classification_without_required_fields(): void
    {
        $this->json('POST', '/api/v1/classifications', [], $this->headers)
            ->assertStatus(422);
    }

    public function test_can_show_classification(): void
    {
        $mapping = ClassificationMapping::create([
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->json('GET', "/api/v1/classifications/{$mapping->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Classification mapping retrieved successfully',
            ]);
    }

    public function test_returns_404_for_nonexistent_classification(): void
    {
        $this->json('GET', '/api/v1/classifications/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_classification(): void
    {
        $newCategory = Category::create(['code' => 'CAT-B', 'name' => 'Category B']);

        $mapping = ClassificationMapping::create([
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->json('PUT', "/api/v1/classifications/{$mapping->id}", [
            'category_id' => $newCategory->id,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Classification mapping updated successfully',
            ]);

        $this->assertDatabaseHas('classification_mappings', [
            'id' => $mapping->id,
            'category_id' => $newCategory->id,
        ]);
    }

    public function test_can_delete_classification(): void
    {
        $mapping = ClassificationMapping::create([
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->json('DELETE', "/api/v1/classifications/{$mapping->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Classification mapping deleted successfully',
            ]);

        $this->assertDatabaseMissing('classification_mappings', ['id' => $mapping->id]);
    }

    public function test_can_resolve_classification(): void
    {
        ClassificationMapping::create([
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->json('POST', '/api/v1/classifications/resolve', [
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'category',
                'mapping',
                'message',
            ])
            ->assertJsonPath('mapping.field_id', $this->field->id)
            ->assertJsonPath('mapping.specialty_id', $this->specialty->id)
            ->assertJsonPath('mapping.rank_id', $this->rank->id);
    }

    public function test_resolve_returns_404_when_no_mapping_found(): void
    {
        $response = $this->json('POST', '/api/v1/classifications/resolve', [
            'field_id' => $this->field->id,
            'specialty_id' => $this->specialty->id,
            'rank_id' => $this->rank->id,
        ], $this->headers);

        $response->assertStatus(404);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/classifications')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/classifications', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
