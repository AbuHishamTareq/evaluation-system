<?php

namespace App\Features\QuestionSubCategories\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuestionSubCategorySampleExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
{
    public function headings(): array
    {
        return [
            'Name',
            'Code',
            'Parent Category Code',
            'Description',
            'Order',
            'Is Active',
        ];
    }

    public function array(): array
    {
        return [
            [
                'Patient Experience',
                'PAT_EXP',
                'PAT_SAT',
                'Sub-categories related to patient experience and feedback',
                1,
                1,
            ],
            [
                'Wait Times',
                'WAIT_TIME',
                'PAT_SAT',
                'Measures related to patient wait times and scheduling',
                2,
                1,
            ],
            [
                'Clinical Outcomes',
                'CLIN_OUT',
                'CLIN_QUAL',
                'Metrics related to clinical treatment outcomes',
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
