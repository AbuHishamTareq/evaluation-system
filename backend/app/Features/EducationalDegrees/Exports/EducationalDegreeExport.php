<?php

namespace App\Features\EducationalDegrees\Exports;

use App\Models\EducationalDegree;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class EducationalDegreeExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return EducationalDegree::orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Description',
            'Is Active',
            'Created At',
        ];
    }

    public function map($degree): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $degree->name,
            $degree->description ?? '-',
            $degree->is_active ? 'Yes' : 'No',
            $degree->created_at?->toIso8601String(),
        ];
    }
}
