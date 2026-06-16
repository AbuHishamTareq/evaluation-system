<?php

namespace App\Features\Questions\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuestionSampleExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
{
    public function headings(): array
    {
        return [
            'question_text',
            'question_type',
            'category_id',
            'description',
            'options',
            'weight',
            'max_score',
            'is_required',
            'is_active',
            'version',
        ];
    }

    public function array(): array
    {
        return [
            [
                'How would you rate the overall service?',
                'rating',
                1,
                'Patient satisfaction rating for this visit',
                null,
                10,
                100,
                'true',
                'true',
                1,
            ],
            [
                'Do you feel you received adequate care?',
                'radio',
                1,
                'Patient perception of care adequacy',
                json_encode(['Yes', 'No']),
                5,
                50,
                'true',
                'true',
                1,
            ],
            [
                'Describe your experience with the staff:',
                'textarea',
                1,
                'Open-ended feedback on staff interaction',
                null,
                15,
                100,
                'true',
                'true',
                1,
            ],
            [
                'Select your preferred appointment time:',
                'select',
                1,
                '',
                json_encode(['Morning', 'Afternoon', 'Evening']),
                5,
                100,
                'true',
                'true',
                1,
            ],
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => ['font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF4F81BD']]],
        ];
    }
}
