<?php

namespace Database\Seeders;

use App\Models\QuestionCategory;
use App\Models\QuestionSubCategory;
use Illuminate\Database\Seeder;

class QuestionSubCategorySeeder extends Seeder
{
    public function run(): void
    {
        $patientSatisfaction = QuestionCategory::where('code', 'PAT_SAT')->first();
        $clinicalQuality = QuestionCategory::where('code', 'CLIN_QUAL')->first();
        $operationalEfficiency = QuestionCategory::where('code', 'OPS_EFF')->first();

        $subCategories = [
            // Patient Satisfaction (2 sub-categories)
            [
                'question_category_id' => $patientSatisfaction?->id,
                'name' => 'Patient Experience',
                'code' => 'PAT_EXP',
                'description' => 'Sub-categories related to patient experience and feedback',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'question_category_id' => $patientSatisfaction?->id,
                'name' => 'Wait Times',
                'code' => 'WAIT_TIME',
                'description' => 'Measures related to patient wait times and scheduling',
                'order' => 2,
                'is_active' => true,
            ],
            // Clinical Quality (2 sub-categories)
            [
                'question_category_id' => $clinicalQuality?->id,
                'name' => 'Clinical Outcomes',
                'code' => 'CLIN_OUT',
                'description' => 'Metrics related to clinical treatment outcomes',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'question_category_id' => $clinicalQuality?->id,
                'name' => 'Patient Safety',
                'code' => 'PAT_SAFE',
                'description' => 'Measures related to patient safety and incident reporting',
                'order' => 2,
                'is_active' => true,
            ],
            // Operational Efficiency (1 sub-category)
            [
                'question_category_id' => $operationalEfficiency?->id,
                'name' => 'Resource Utilization',
                'code' => 'RES_UTIL',
                'description' => 'Metrics covering resource allocation and utilization',
                'order' => 1,
                'is_active' => true,
            ],
        ];

        foreach ($subCategories as $subCategory) {
            QuestionSubCategory::firstOrCreate(
                ['code' => $subCategory['code']],
                $subCategory
            );
        }
    }
}
