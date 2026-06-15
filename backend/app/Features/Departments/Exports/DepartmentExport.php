<?php

namespace App\Features\Departments\Exports;

use App\Models\Department;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class DepartmentExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Department::with('center')->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Description',
            'Center Name',
            'Is Active',
            'Created At',
        ];
    }

    public function map($department): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $department->name,
            $department->description ?? '-',
            $department->center?->name ?? '-',
            $department->is_active ? 'Yes' : 'No',
            $department->created_at?->toIso8601String(),
        ];
    }
}
