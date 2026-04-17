<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Shift;
use App\Models\StaffProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Shift>
 */
class ShiftFactory extends Factory
{
    public function definition(): array
    {
        return [
            'staff_profile_id' => StaffProfile::factory(),
            'department_id' => Department::factory(),
            'date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'start_time' => '08:00',
            'end_time' => '16:00',
            'status' => 'scheduled',
            'notes' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
        ]);
    }

    public function morning(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_time' => '08:00',
            'end_time' => '16:00',
        ]);
    }

    public function night(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_time' => '22:00',
            'end_time' => '06:00',
        ]);
    }
}
