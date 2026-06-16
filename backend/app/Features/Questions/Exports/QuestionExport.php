<?php

namespace App\Features\Questions\Exports;

use App\Models\Question;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuestionExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Question::with(['category', 'subCategory'])
            ->select([
                'id',
                'category_id',
                'sub_category_id',
                'question_text',
                'description',
                'question_type',
                'options',
                'weight',
                'max_score',
                'is_required',
                'is_active',
                'version',
                'created_at',
            ])
            ->orderBy('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Question Text',
            'Question Type',
            'Category Code',
            'Sub-Category Code',
            'Description',
            'Options',
            'Weight',
            'Max Score',
            'Required',
            'Active',
            'Version',
            'Created At',
        ];
    }

    public function map($question): array
    {
        return [
            $question->id,
            $question->question_text,
            $question->question_type,
            $question->category?->code,
            $question->subCategory?->code,
            $question->description,
            $question->options ? json_encode($question->options) : null,
            $question->weight,
            $question->max_score,
            $question->is_required ? 1 : 0,
            $question->is_active ? 1 : 0,
            $question->version,
            $question->created_at?->toIso8601String(),
        ];
    }
}
