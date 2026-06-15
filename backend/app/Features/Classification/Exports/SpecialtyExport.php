<?php

namespace App\Features\Classification\Exports;

use App\Models\Specialty;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SpecialtyExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Specialty::with('field')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Field Name',
            'Name',
            'Description',
            'Is Active',
        ];
    }

    public function map($specialty): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $specialty->field?->name ?? '-',
            $specialty->name,
            $specialty->description,
            $specialty->is_active ? 'Yes' : 'No',
        ];
    }
}
