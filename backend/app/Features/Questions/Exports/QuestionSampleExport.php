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
        ];
    }

    public function array(): array
    {
        return [
            [
                'How would you rate the overall service?',
                'rating',
                'PAT_SAT',
                '',
                'Patient satisfaction rating for this visit',
                null,
                10,
                100,
                1,
                1,
            ],
            [
                'Do you feel you received adequate care?',
                'radio',
                'CLIN_QUAL',
                'CLIN_OUT',
                'Patient perception of care adequacy',
                'Yes, No',
                5,
                50,
                1,
                1,
            ],
            [
                'Describe your experience with the staff:',
                'textarea',
                'STAFF_COMP',
                '',
                'Open-ended feedback on staff interaction',
                null,
                15,
                100,
                1,
                1,
            ],
            [
                'Select your preferred appointment time:',
                'select',
                'OPS_EFF',
                'WAIT_TIME',
                '',
                'Morning, Afternoon, Evening',
                5,
                100,
                1,
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
