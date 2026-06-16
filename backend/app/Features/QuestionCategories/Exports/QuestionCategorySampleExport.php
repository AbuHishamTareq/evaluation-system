<?php

namespace App\Features\QuestionCategories\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class QuestionCategorySampleExport implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
{
    public function headings(): array
    {
        return [
            'Name',
            'Code',
            'Description',
            'Order',
            'Is Active',
        ];
    }

    public function array(): array
    {
        return [
            [
                'Patient Satisfaction',
                'PAT_SAT',
                'Categories related to patient satisfaction and experience',
                1,
                1,
            ],
            [
                'Clinical Quality',
                'CLIN_QUAL',
                'Measures related to clinical care quality and outcomes',
                2,
                1,
            ],
            [
                'Operational Efficiency',
                'OPS_EFF',
                'Categories covering operational and administrative metrics',
                3,
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
