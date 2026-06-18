<?php

namespace App\Features\Questions\Exports;

use App\Models\Question;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuestionExport implements FromCollection, WithHeadings, WithMapping
{
    private int $rowNumber = 0;

    public function collection()
    {
        return Question::with(['category', 'subCategory'])
            ->select([
                'id',
                'category_id',
                'sub_category_id',
                'question_text',
                'question_type',
                'options',
            ])
            ->orderBy('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Question',
            'Category / Sub Category',
            'Question Type',
            'Options',
        ];
    }

    public function map($question): array
    {
        $this->rowNumber++;

        $category = $question->category?->name ?? $question->subCategory?->name ?? '';

        $options = '';
        if ($question->options && is_array($question->options)) {
            $labels = [];
            foreach ($question->options as $option) {
                if (is_string($option)) {
                    $labels[] = $option;
                } elseif (is_array($option) && isset($option['label'])) {
                    $labels[] = $option['label'];
                }
            }
            $options = implode(', ', $labels);
        }

        return [
            $this->rowNumber,
            $question->question_text,
            $category,
            $question->question_type,
            $options,
        ];
    }
}
