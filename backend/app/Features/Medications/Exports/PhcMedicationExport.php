<?php

namespace App\Features\Medications\Exports;

use App\Models\PhcMedication;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PhcMedicationExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected int $rowNumber = 0;

    private const HEADER_BG = '4f81bd';

    private const HEADER_FONT_COLOR = 'FFFFFF';

    public function collection()
    {
        return PhcMedication::with(['phcCenter', 'medication'])
            ->orderBy('id')
            ->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'PHC Center',
            'Medication',
            'Strength',
            'Recommended Quantity',
            'Current Stock',
            'Allocation Location',
            'Notes',
        ];
    }

    public function map($phcMedication): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $phcMedication->phcCenter?->name ?? '-',
            $phcMedication->medication?->name ?? '-',
            $phcMedication->medication?->strength ?? '-',
            $phcMedication->recommended_quantity,
            $phcMedication->current_stock ?? '-',
            $phcMedication->allocation_location ?? '-',
            $phcMedication->notes ?? '-',
        ];
    }

    public function styles(Worksheet $sheet): void
    {
        $headerRange = 'A1:'.$sheet->getHighestDataColumn().'1';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => self::HEADER_FONT_COLOR],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => self::HEADER_BG],
            ],
            'alignment' => [
                'horizontal' => 'center',
                'vertical' => 'center',
            ],
        ]);

        $lastRow = $sheet->getHighestDataRow();
        if ($lastRow > 1) {
            $dataRange = 'A2:'.$sheet->getHighestDataColumn().$lastRow;
            $sheet->getStyle($dataRange)->applyFromArray([
                'alignment' => [
                    'vertical' => 'center',
                ],
            ]);
        }
    }
}
