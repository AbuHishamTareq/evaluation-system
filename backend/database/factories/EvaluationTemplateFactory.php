<?php

namespace Database\Factories;

use App\Models\EvaluationTemplate;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EvaluationTemplate>
 */
class EvaluationTemplateFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->randomElement(['Annual Performance', 'Patient Safety', 'Teamwork Assessment']),
            'name_ar' => 'تقييم ',
            'description' => 'Annual performance evaluation template',
            'description_ar' => 'تقييم سنوي',
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
