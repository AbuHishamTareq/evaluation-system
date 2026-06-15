<?php

namespace App\Features\Classification\Exports;

use App\Models\ClassificationMapping;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ClassificationMappingExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return ClassificationMapping::with(['field', 'specialty', 'rank', 'category'])->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Field Name',
            'Specialty Name',
            'Rank Name',
            'Category Code',
        ];
    }

    public function map($mapping): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $mapping->field?->name ?? '-',
            $mapping->specialty?->name ?? '-',
            $mapping->rank?->name ?? '-',
            $mapping->category?->code ?? '-',
        ];
    }
}
