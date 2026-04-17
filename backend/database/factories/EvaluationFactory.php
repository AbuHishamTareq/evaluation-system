<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Evaluation;
use App\Models\EvaluationTemplate;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Evaluation>
 */
class EvaluationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'template_id' => EvaluationTemplate::factory(),
            'staff_profile_id' => StaffProfile::factory(),
            'evaluator_id' => User::factory(),
            'department_id' => Department::factory(),
            'total_score' => 0,
            'max_score' => 100,
            'percentage' => 0,
            'status' => Evaluation::STATUS_PENDING,
        ];
    }

    public function completed(int $score = 80): static
    {
        return $this->state(fn (array $attributes) => [
            'total_score' => $score,
            'max_score' => 100,
            'percentage' => $score,
            'status' => Evaluation::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Evaluation::STATUS_IN_PROGRESS,
        ]);
    }
}
