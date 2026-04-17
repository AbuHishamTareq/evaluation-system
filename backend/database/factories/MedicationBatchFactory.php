<?php

namespace Database\Factories;

use App\Models\Medication;
use App\Models\MedicationBatch;
use App\Models\PhcCenter;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MedicationBatch>
 */
class MedicationBatchFactory extends Factory
{
    public function definition(): array
    {
        return [
            'medication_id' => Medication::factory(),
            'phc_center_id' => PhcCenter::factory(),
            'batch_number' => 'BAT'.fake()->unique()->numerify('#####'),
            'quantity' => fake()->numberBetween(50, 500),
            'alert_threshold' => 50,
            'manufacture_date' => fake()->date('Y-m-d', '-6 months'),
            'expiry_date' => now()->addMonths(fake()->numberBetween(6, 24)),
            'purchase_price' => fake()->randomFloat(2, 10, 100),
            'status' => MedicationBatch::STATUS_AVAILABLE,
        ];
    }

    public function lowStock(): static
    {
        return $this->state(fn (array $attributes) => [
            'quantity' => 30,
            'alert_threshold' => 50,
            'status' => MedicationBatch::STATUS_LOW_STOCK,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => now()->subMonth(),
            'status' => MedicationBatch::STATUS_EXPIRED,
        ]);
    }

    public function nearExpiry(int $days = 15): static
    {
        return $this->state(fn (array $attributes) => [
            'expiry_date' => now()->addDays($days),
        ]);
    }

    public function recalled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => MedicationBatch::STATUS_RECALLED,
        ]);
    }
}
