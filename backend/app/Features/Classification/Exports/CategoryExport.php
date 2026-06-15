<?php

namespace App\Features\Classification\Exports;

use App\Models\Category;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CategoryExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Category::all();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Code',
            'Name',
            'Description',
            'Is Active',
        ];
    }

    public function map($category): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $category->code,
            $category->name,
            $category->description,
            $category->is_active ? 'Yes' : 'No',
        ];
    }
}
