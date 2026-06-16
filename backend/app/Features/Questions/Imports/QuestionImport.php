<?php

namespace App\Features\Questions\Imports;

use App\Models\Question;
use App\Models\QuestionCategory;
use App\Models\QuestionSubCategory;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class QuestionImport implements OnEachRow, WithHeadingRow, WithValidation
{
    use Importable;

    protected array $categoryCache = [];

    protected array $subCategoryCache = [];

    protected function resolveCategoryId(string $code): ?int
    {
        if (! isset($this->categoryCache[$code])) {
            $category = QuestionCategory::where('code', $code)->first();
            $this->categoryCache[$code] = $category?->id;
        }

        return $this->categoryCache[$code];
    }

    protected function resolveSubCategoryId(string $code): ?int
    {
        if (! isset($this->subCategoryCache[$code])) {
            $subCategory = QuestionSubCategory::where('code', $code)->first();
            $this->subCategoryCache[$code] = $subCategory?->id;
        }

        return $this->subCategoryCache[$code];
    }

    public function onRow(Row $row): void
    {
        $row = $row->toArray();

        $categoryId = $this->resolveCategoryId($row['category_code']);
        if (! $categoryId) {
            return;
        }

        $questionType = $row['question_type'] ?? 'text';
        // Backward compatibility: yes_no was migrated to radio
        if ($questionType === 'yes_no') {
            $questionType = 'radio';
        }

        $questionData = [
            'category_id' => $categoryId,
            'question_text' => $row['question_text'],
            'question_type' => $questionType,
            'is_active' => isset($row['is_active']) ? filter_var($row['is_active'], FILTER_VALIDATE_BOOLEAN) : true,
            'is_required' => isset($row['is_required']) ? filter_var($row['is_required'], FILTER_VALIDATE_BOOLEAN) : true,
        ];

        // Resolve optional sub_category_code
        if (! empty($row['sub_category_code'])) {
            $subCategoryId = $this->resolveSubCategoryId($row['sub_category_code']);
            if ($subCategoryId) {
                $questionData['sub_category_id'] = $subCategoryId;
            }
        }

        // Optional fields
        if (! empty($row['description'])) {
            $questionData['description'] = $row['description'];
        }

        if (! empty($row['options'])) {
            $options = is_string($row['options']) ? $row['options'] : '';

            // Try JSON first
            $parsed = json_decode($options, true);
            if (is_array($parsed)) {
                $questionData['options'] = $parsed;
            } else {
                // Comma-separated labels → convert to proper format
                $labels = array_map('trim', explode(',', $options));
                $labels = array_filter($labels, fn ($l) => $l !== '');
                if (! empty($labels)) {
                    $questionData['options'] = array_map(fn ($label) => [
                        'label' => $label,
                        'value' => strtolower((string) preg_replace('/[^a-zA-Z0-9]+/', '_', $label)),
                    ], array_values($labels));
                }
            }
        }

        if (! empty($row['weight'])) {
            $questionData['weight'] = (int) $row['weight'];
        }

        if (! empty($row['max_score'])) {
            $questionData['max_score'] = (int) $row['max_score'];
        }

        if (! empty($row['version'])) {
            $questionData['version'] = (int) $row['version'];
        }

        Question::create($questionData);
    }

    public function rules(): array
    {
        return [
            'question_text' => ['required', 'string'],
            'question_type' => ['required', 'string', 'in:text,textarea,select,radio,checkbox,rating,yes_no'],
            'category_code' => ['required', 'string', 'exists:question_categories,code'],
            'sub_category_code' => ['nullable', 'string', 'exists:question_sub_categories,code'],
            'description' => ['nullable', 'string'],
            'options' => ['nullable', 'string'],
            'weight' => ['nullable', 'integer', 'min:0', 'max:100'],
            'max_score' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'is_required' => ['nullable', 'in:true,false,1,0,0,1'],
            'is_active' => ['nullable', 'in:true,false,1,0,0,1'],
            'version' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function customValidationMessages(): array
    {
        return [
            'question_type.in' => 'The Question Type must be one of: text, textarea, select, radio, checkbox, rating, yes_no (note: yes_no is automatically converted to radio).',
            'category_code.exists' => 'The Category Code ":input" was not found. Check the codes in your Question Categories module.',
            'sub_category_code.exists' => 'The Sub-Category Code ":input" was not found. Check the codes in your Question Sub-Categories module.',
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'question_text' => 'Question Text',
            'question_type' => 'Question Type',
            'category_code' => 'Category Code',
            'sub_category_code' => 'Sub-Category Code',
            'description' => 'Description',
            'options' => 'Options',
            'weight' => 'Weight',
            'max_score' => 'Max Score',
            'is_required' => 'Required',
            'is_active' => 'Active',
            'version' => 'Version',
        ];
    }
}
