<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\PhcCenter;
use App\Models\StaffProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StaffProfile>
 */
class StaffProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'phc_center_id' => PhcCenter::factory(),
            'department_id' => Department::factory(),
            'employee_id' => 'EMP'.fake()->unique()->numerify('#####'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'first_name_ar' => 'Arabic First',
            'last_name_ar' => 'Arabic Last',
            'phone' => fake()->phoneNumber(),
            'national_id' => fake()->unique()->numerify('##########'),
            'birth_date' => fake()->date('Y-m-d', '-20 years'),
            'gender' => fake()->randomElement(['male', 'female']),
            'scfhs_license' => 'SCFHS'.fake()->unique()->numerify('####'),
            'scfhs_license_expiry' => now()->addMonths(fake()->numberBetween(6, 24)),
            'malpractice_insurance' => 'INS'.fake()->unique()->numerify('####'),
            'malpractice_expiry' => now()->addMonths(fake()->numberBetween(6, 24)),
            'certifications' => json_encode(['BLS', 'ACLS']),
            'education' => json_encode(['Bachelor of Nursing']),
            'employment_status' => 'active',
            'hire_date' => fake()->date('Y-m-d', '-2 years'),
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_status' => 'inactive',
            'termination_date' => now(),
        ]);
    }

    public function withExpiringLicense(int $days = 30): static
    {
        return $this->state(fn (array $attributes) => [
            'scfhs_license_expiry' => now()->addDays($days),
        ]);
    }

    public function withExpiringInsurance(int $days = 30): static
    {
        return $this->state(fn (array $attributes) => [
            'malpractice_expiry' => now()->addDays($days),
        ]);
    }
}
