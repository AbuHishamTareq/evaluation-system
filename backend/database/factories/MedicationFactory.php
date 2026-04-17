<?php

namespace Database\Factories;

use App\Models\Medication;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Medication>
 */
class MedicationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'name' => fake()->randomElement(['Panadol', 'Brufen', 'Nurofen', 'Amoxil', 'Zyrtec', 'Augmentin']),
            'generic_name' => fake()->randomElement(['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Cetirizine']),
            'brand_name' => fake()->company(),
            'atc_code' => 'N02BE'.fake()->randomNumber(1),
            'form' => fake()->randomElement(['tablet', 'capsule', 'liquid', 'injection']),
            'strength' => fake()->randomElement(['100mg', '200mg', '500mg', '1g']),
            'unit' => 'tablet',
            'storage_requirements' => 'Room temperature, below 30°C',
        ];
    }
}
