<?php

namespace App\Features\TeamCodes\Exports;

use App\Models\TeamCode;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TeamCodeExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx'
    ) {}

    public function collection()
    {
        return TeamCode::with('center')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Code',
            'Description',
            'Center Name',
            'Is Active',
            'Staff Count',
            'Created At',
        ];
    }

    public function map($teamCode): array
    {
        $this->rowNumber++;

        $centerName = $teamCode->center ? $teamCode->center->name : '-';
        $staffCount = $teamCode->staff()->count();

        return [
            $this->rowNumber,
            $teamCode->code,
            $teamCode->description,
            $centerName,
            $teamCode->is_active ? 'Yes' : 'No',
            $staffCount,
            $teamCode->created_at?->toIso8601String(),
        ];
    }
}
