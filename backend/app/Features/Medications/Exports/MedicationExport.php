<?php

namespace App\Features\Medications\Exports;

use App\Models\Medication;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class MedicationExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx',
        protected array $filters = []
    ) {}

    public function collection()
    {
        $query = Medication::query();

        if (! empty($this->filters['search'])) {
            $query->where(function ($q) {
                $q->where('name', 'like', "%{$this->filters['search']}%")
                    ->orWhere('strength', 'like', "%{$this->filters['search']}%")
                    ->orWhere('form', 'like', "%{$this->filters['search']}%")
                    ->orWhere('category', 'like', "%{$this->filters['search']}%");
            });
        }

        if (isset($this->filters['is_active'])) {
            $query->where('is_active', $this->filters['is_active']);
        }

        return $query->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Medication Name',
            'Strength',
            'Form',
            'Unit',
            'Category',
            'Is Active',
        ];
    }

    public function map($medication): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $medication->name,
            $medication->strength ?? '-',
            $medication->form ?? '-',
            $medication->unit ?? '-',
            $medication->category ?? '-',
            $medication->is_active ? 'Yes' : 'No',
        ];
    }
}
