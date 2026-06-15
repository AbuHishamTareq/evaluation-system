<?php

namespace App\Features\Classification\Exports;

use App\Models\Rank;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class RankExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Rank::all();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Description',
            'Level',
            'Is Active',
        ];
    }

    public function map($rank): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $rank->name,
            $rank->description,
            $rank->level,
            $rank->is_active ? 'Yes' : 'No',
        ];
    }
}
