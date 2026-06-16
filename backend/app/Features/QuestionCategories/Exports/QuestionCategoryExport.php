<?php

namespace App\Features\QuestionCategories\Exports;

use App\Models\QuestionCategory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuestionCategoryExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function collection()
    {
        return QuestionCategory::orderBy('order', 'asc')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Code',
            'Description',
            'Order',
            'Is Active',
        ];
    }

    public function map($category): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $category->name,
            $category->code,
            $category->description,
            $category->order,
            $category->is_active ? 'Yes' : 'No',
        ];
    }
}
