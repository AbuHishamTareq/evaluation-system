<?php

namespace Database\Factories;

use App\Models\QuestionCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<QuestionCategory>
 */
class QuestionCategoryFactory extends Factory
{
    protected $model = QuestionCategory::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->word(),
            'code' => strtoupper($this->faker->unique()->lexify('???')),
            'description' => $this->faker->sentence(),
            'order' => $this->faker->numberBetween(1, 100),
            'is_active' => $this->faker->boolean(80),
        ];
    }

    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
