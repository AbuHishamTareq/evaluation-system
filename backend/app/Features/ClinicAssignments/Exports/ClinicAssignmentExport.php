<?php

namespace App\Features\ClinicAssignments\Exports;

use App\Models\ClinicAssignment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ClinicAssignmentExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return ClinicAssignment::orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Clinic Assignment',
            'Description',
            'Is Active',
            'Created At',
        ];
    }

    public function map($clinicAssignment): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $clinicAssignment->name,
            $clinicAssignment->description ?? '-',
            $clinicAssignment->is_active ? 'Yes' : 'No',
            $clinicAssignment->created_at?->toIso8601String(),
        ];
    }
}
