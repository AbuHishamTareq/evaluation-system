<?php

namespace Database\Seeders;

use App\Models\QuestionCategory;
use Illuminate\Database\Seeder;

class QuestionCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Patient Satisfaction',
                'code' => 'PAT_SAT',
                'description' => 'Measures related to patient satisfaction and overall experience',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Clinical Quality',
                'code' => 'CLIN_QUAL',
                'description' => 'Evaluates clinical care quality, treatment outcomes, and patient safety',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Operational Efficiency',
                'code' => 'OPS_EFF',
                'description' => 'Assesses operational workflows, resource utilization, and administrative performance',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Staff Competency',
                'code' => 'STAFF_COMP',
                'description' => 'Evaluates staff qualifications, skills, training, and professional development',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Infrastructure & Safety',
                'code' => 'INFRA_SAFE',
                'description' => 'Assesses facility infrastructure, equipment, and workplace safety standards',
                'order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            QuestionCategory::firstOrCreate(
                ['code' => $category['code']],
                $category
            );
        }
    }
}
