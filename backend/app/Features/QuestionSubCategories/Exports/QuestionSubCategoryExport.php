<?php

namespace App\Features\QuestionSubCategories\Exports;

use App\Models\QuestionSubCategory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuestionSubCategoryExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function collection()
    {
        return QuestionSubCategory::with('category')->orderBy('order', 'asc')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Code',
            'Parent Category',
            'Description',
            'Order',
            'Is Active',
        ];
    }

    public function map($subCategory): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $subCategory->name,
            $subCategory->code,
            $subCategory->category?->name,
            $subCategory->description,
            $subCategory->order,
            $subCategory->is_active ? 'Yes' : 'No',
        ];
    }
}
