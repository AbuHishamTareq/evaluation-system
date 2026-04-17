<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\PhcCenter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Department>
 */
class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'phc_center_id' => PhcCenter::factory(),
            'name' => fake()->randomElement(['Emergency', 'Pediatrics', 'Internal Medicine', 'Surgery', 'Obstetrics', 'Dental', 'Laboratory', 'Pharmacy']),
            'name_ar' => 'قسم ',
            'code' => 'DEPT'.fake()->unique()->numerify('###'),
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
