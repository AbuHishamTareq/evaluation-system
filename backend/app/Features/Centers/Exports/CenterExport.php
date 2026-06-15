<?php

namespace App\Features\Centers\Exports;

use App\Models\PhcCenter;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CenterExport implements FromCollection, WithHeadings, WithMapping
{
    protected int $rowNumber = 0;

    public function __construct(
        protected string $format = 'xlsx',
        protected array $filters = []
    ) {}

    public function collection()
    {
        $query = PhcCenter::query()->with('zone');

        if (! empty($this->filters['search'])) {
            $query->where(function ($q) {
                $q->where('name', 'like', "%{$this->filters['search']}%")
                    ->orWhere('code', 'like', "%{$this->filters['search']}%");
            });
        }

        if (! empty($this->filters['zone_id'])) {
            $query->where('zone_id', $this->filters['zone_id']);
        }

        if (! empty($this->filters['classification'])) {
            $query->where('classification', $this->filters['classification']);
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
            'Center Name',
            'Center Code',
            'Zone Name',
            'Classification',
            'Address',
            'Phone',
            'Email',
            'Is Active',
            'Notes',
        ];
    }

    public function map($center): array
    {
        $this->rowNumber++;

        $zoneName = $center->getRelation('zone')?->name ?? '-';

        return [
            $this->rowNumber,
            $center->name,
            $center->code,
            $zoneName,
            $this->formatClassification($center->classification),
            $center->address,
            $center->phone,
            $center->email,
            $center->is_active ? 'Yes' : 'No',
            $center->notes,
        ];
    }

    protected function formatClassification(?string $classification): string
    {
        return match ($classification) {
            'primary' => 'Primary',
            'secondary' => 'Secondary',
            'specialized' => 'Specialized',
            'community' => 'Community',
            default => $classification ?? '-',
        };
    }
}
