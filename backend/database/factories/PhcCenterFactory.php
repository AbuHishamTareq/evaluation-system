<?php

namespace Database\Factories;

use App\Models\PhcCenter;
use App\Models\Region;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PhcCenter>
 */
class PhcCenterFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'region_id' => Region::factory(),
            'name' => fake()->company().' PHC',
            'name_ar' => 'مركز صحة ',
            'code' => 'PHC'.fake()->unique()->numerify('###'),
            'address' => fake()->address(),
            'phone' => fake()->phoneNumber(),
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
