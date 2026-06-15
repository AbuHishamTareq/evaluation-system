<?php

namespace Tests\Feature\Classification;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
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

    public function test_can_list_categories(): void
    {
        Category::create(['code' => 'A', 'name' => 'Category A']);
        Category::create(['code' => 'B', 'name' => 'Category B']);

        $response = $this->json('GET', '/api/v1/categories', [], $this->headers);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    '*' => ['id', 'code', 'name', 'description', 'is_active', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_can_create_category(): void
    {
        $response = $this->json('POST', '/api/v1/categories', [
            'code' => 'CAT-A',
            'name' => 'Category A',
            'description' => 'Test category',
        ], $this->headers);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Category created successfully',
            ]);

        $this->assertDatabaseHas('categories', [
            'code' => 'CAT-A',
            'name' => 'Category A',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_duplicate_category_code(): void
    {
        Category::create(['code' => 'CAT-A', 'name' => 'Existing']);

        $this->json('POST', '/api/v1/categories', [
            'code' => 'CAT-A',
        ], $this->headers)->assertStatus(422);
    }

    public function test_can_show_category(): void
    {
        $category = Category::create(['code' => 'CAT-B', 'name' => 'Category B']);

        $response = $this->json('GET', "/api/v1/categories/{$category->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Category retrieved successfully',
            ])
            ->assertJsonPath('data.code', 'CAT-B');
    }

    public function test_returns_404_for_nonexistent_category(): void
    {
        $this->json('GET', '/api/v1/categories/99999', [], $this->headers)
            ->assertStatus(404);
    }

    public function test_can_update_category(): void
    {
        $category = Category::create(['code' => 'CAT-C', 'name' => 'Old Name']);

        $response = $this->json('PUT', "/api/v1/categories/{$category->id}", [
            'name' => 'Updated Name',
            'code' => 'CAT-UPDATED',
        ], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Category updated successfully',
            ]);

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'code' => 'CAT-UPDATED',
            'name' => 'Updated Name',
        ]);
    }

    public function test_can_delete_category(): void
    {
        $category = Category::create(['code' => 'CAT-DEL', 'name' => 'To Delete']);

        $response = $this->json('DELETE', "/api/v1/categories/{$category->id}", [], $this->headers);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Category deleted successfully',
            ]);

        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }

    public function test_returns_401_unauthenticated(): void
    {
        $this->json('GET', '/api/v1/categories')->assertStatus(401);
    }

    public function test_returns_403_unauthorized(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->json('GET', '/api/v1/categories', [], [
            'Authorization' => 'Bearer '.$token,
        ])->assertStatus(403);
    }
}
