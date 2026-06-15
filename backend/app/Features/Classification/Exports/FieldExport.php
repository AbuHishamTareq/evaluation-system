<?php

namespace App\Features\Classification\Exports;

use App\Models\Field;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class FieldExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Field::all();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Description',
            'Is Active',
        ];
    }

    public function map($field): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $field->name,
            $field->description,
            $field->is_active ? 'Yes' : 'No',
        ];
    }
}
