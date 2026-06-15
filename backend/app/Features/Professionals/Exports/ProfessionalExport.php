<?php

namespace App\Features\Professionals\Exports;

use App\Models\Professional;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProfessionalExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Professional::orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Role Name',
            'Description',
            'Is Active',
            'Created At',
        ];
    }

    public function map($professional): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $professional->name,
            $professional->description ?? '-',
            $professional->is_active ? 'Yes' : 'No',
            $professional->created_at?->toIso8601String(),
        ];
    }
}
