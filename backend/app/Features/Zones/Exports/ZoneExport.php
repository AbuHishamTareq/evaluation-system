<?php

namespace App\Features\Zones\Exports;

use App\Models\Zone;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ZoneExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return Zone::with('parent')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Code',
            'Level',
            'Parent',
            'Description',
        ];
    }

    public function map($zone): array
    {
        $this->rowNumber++;

        $parentName = $zone->parent ? $zone->parent->name : '-';

        return [
            $this->rowNumber,
            $zone->name,
            $zone->code,
            ucfirst($zone->level),
            $parentName,
            $zone->description,
        ];
    }
}
