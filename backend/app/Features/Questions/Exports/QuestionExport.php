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
        return Question::with('category')
            ->select([
                'id',
                'category_id',
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
            'id',
            'category_id',
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
        ];
    }

    public function map($question): array
    {
        return [
            $question->id,
            $question->category_id,
            $question->question_text,
            $question->description,
            $question->question_type,
            $question->options ? json_encode($question->options) : null,
            $question->weight,
            $question->max_score,
            $question->is_required ? 'true' : 'false',
            $question->is_active ? 'true' : 'false',
            $question->version,
            $question->created_at?->toIso8601String(),
        ];
    }
}
