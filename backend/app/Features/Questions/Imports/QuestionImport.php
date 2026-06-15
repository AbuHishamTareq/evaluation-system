<?php

namespace App\Features\Questions\Imports;

use App\Models\Question;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class QuestionImport implements OnEachRow, WithHeadingRow, WithValidation
{
    use Importable;

    public function onRow(Row $row): void
    {
        $row = $row->toArray();

        $questionData = [
            'category_id' => $row['category_id'],
            'question_text' => $row['question_text'],
            'question_type' => $row['question_type'],
            'is_active' => isset($row['is_active']) && $row['is_active'] === 'true',
            'is_required' => isset($row['is_required']) ? $row['is_required'] === 'true' : true,
        ];

        // Optional fields
        if (! empty($row['description'])) {
            $questionData['description'] = $row['description'];
        }

        if (! empty($row['options'])) {
            // Handle JSON string or array
            if (is_string($row['options'])) {
                $questionData['options'] = json_decode($row['options'], true);
            } else {
                $questionData['options'] = $row['options'];
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
            'question_type' => ['required', 'string', 'in:text,textarea,select,radio,checkbox,rating'],
            'category_id' => ['required', 'integer', 'exists:question_categories,id'],
            'description' => ['nullable', 'string'],
            'options' => ['nullable', 'json'],
            'weight' => ['nullable', 'integer', 'min:0', 'max:100'],
            'max_score' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'is_required' => ['nullable', 'string', 'in:true,false'],
            'is_active' => ['nullable', 'string', 'in:true,false'],
            'version' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'question_text' => 'Question Text',
            'question_type' => 'Question Type',
            'category_id' => 'Category',
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
