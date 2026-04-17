<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Issue;
use App\Models\PhcCenter;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Issue>
 */
class IssueFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'phc_center_id' => PhcCenter::factory(),
            'reporter_id' => User::factory(),
            'assignee_id' => User::factory(),
            'department_id' => Department::factory(),
            'title' => 'Issue '.fake()->sentence(4),
            'description' => fake()->paragraph(),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'status' => Issue::STATUS_OPEN,
        ];
    }

    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Issue::STATUS_RESOLVED,
            'resolved_at' => now(),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Issue::STATUS_IN_PROGRESS,
        ]);
    }

    public function urgent(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => Issue::PRIORITY_URGENT,
        ]);
    }
}
