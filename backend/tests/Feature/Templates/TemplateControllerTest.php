<?php

namespace Tests\Feature\Templates;

use App\Models\EvaluationTemplate;
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
}
