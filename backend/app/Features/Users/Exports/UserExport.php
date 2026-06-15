<?php

namespace App\Features\Users\Exports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UserExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    use Exportable;

    protected int $rowNumber = 0;

    public function __construct(
        protected array $filters = []
    ) {}

    public function collection(): Collection
    {
        $query = User::query()->with('roles');

        if (! empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if (! empty($this->filters['role'])) {
            $query->where('role', $this->filters['role']);
        }

        if (isset($this->filters['is_active'])) {
            $query->where('is_active', filter_var($this->filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Name',
            'Email',
            'Role',
            'Employee ID',
            'Is Active',
            'Created At',
        ];
    }

    public function map($user): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $user->name,
            $user->email,
            $user->role,
            $user->employee_id ?? '-',
            $user->is_active ? 'Yes' : 'No',
            $user->created_at?->format('Y-m-d H:i:s') ?? '-',
        ];
    }
}
