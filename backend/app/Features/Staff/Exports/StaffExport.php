<?php

namespace App\Features\Staff\Exports;

use App\Models\Staff;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class StaffExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping
{
    use Exportable;

    protected int $rowNumber = 0;

    public function __construct(
        protected array $filters = []
    ) {}

    public function collection(): Collection
    {
        $query = Staff::query()
            ->with(['center', 'teamCode', 'educationalDegrees']);

        if (isset($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (isset($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (isset($this->filters['employment_type'])) {
            $query->where('employment_type', $this->filters['employment_type']);
        }

        if (isset($this->filters['is_active'])) {
            $query->where('is_active', filter_var($this->filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($this->filters['department_id'])) {
            $query->where('department_id', $this->filters['department_id']);
        }

        return $query->orderBy('first_name')->get();
    }

    public function headings(): array
    {
        return [
            'No.',
            'Staff ID',
            'First Name',
            'Middle Name',
            'Last Name',
            'Full Name',
            'Email',
            'Phone',
            'Mobile',
            'Gender',
            'Date of Birth',
            'Nationality',
            'National ID',

            'Address',
            'Notes',
            'PHC Center',
            'Department',
            'Professional Role',
            'Clinic Assignment',
            'Employment Type',
            'Hire Date',
            'Termination Date',
            'Is Care Provider',
            'Team Code',
            'SCFHS Registration No',
            'SCFHS Issue Date',
            'SCFHS Expiry Date',
            'Malpractice Insurance No',
            'Malpractice Issue Date',
            'Malpractice Expiry Date',
            'Status',
            'Is Active',
            'Education',
            'Experience',
            'Certifications',
        ];
    }

    public function map($staff): array
    {
        $this->rowNumber++;

        return [
            $this->rowNumber,
            $staff->employee_id,
            $staff->first_name,
            $staff->middle_name ?? '-',
            $staff->last_name,
            $staff->full_name,
            $staff->email ?? '-',
            $staff->phone ?? '-',
            $staff->mobile ?? '-',
            $staff->gender ?? '-',
            $staff->date_of_birth?->format('Y-m-d') ?? '-',
            $staff->nationality ?? '-',
            $staff->national_id ?? '-',
            $staff->address ?? '-',
            $staff->notes ?? '-',
            $staff->center?->name ?? '-',
            $staff->department?->name ?? '-',
            $staff->professional?->name ?? '-',
            $staff->clinicAssignment?->name ?? '-',
            $staff->employment_type ? ucwords(str_replace('_', ' ', $staff->employment_type)) : '-',
            $staff->hire_date?->format('Y-m-d') ?? '-',
            $staff->termination_date?->format('Y-m-d') ?? '-',
            $staff->is_care_provider ? 'Yes' : 'No',
            $staff->teamCode?->code ?? '-',
            $staff->scfhs_registration_no ?? '-',
            $staff->scfhs_issue_date?->format('Y-m-d') ?? '-',
            $staff->scfhs_expiry_date?->format('Y-m-d') ?? '-',
            $staff->malpractice_insurance_no ?? '-',
            $staff->malpractice_issue_date?->format('Y-m-d') ?? '-',
            $staff->malpractice_expiry_date?->format('Y-m-d') ?? '-',
            $staff->status ?? '-',
            $staff->is_active ? 'Yes' : 'No',
            $this->formatEducation($staff),
            $this->formatExperience($staff),
            $this->formatCertifications($staff),
        ];
    }

    protected function formatEducation(Staff $staff): string
    {
        if ($staff->educationalDegrees->isEmpty()) {
            return '-';
        }

        return $staff->educationalDegrees->map(function ($degree) {
            $parts = [$degree->name];
            if ($degree->pivot->institution) {
                $parts[] = $degree->pivot->institution;
            }
            if ($degree->pivot->year_obtained) {
                $parts[] = $degree->pivot->year_obtained;
            }

            return implode(', ', $parts);
        })->implode('; ');
    }

    protected function formatExperience(Staff $staff): string
    {
        if ($staff->experiences->isEmpty()) {
            return '-';
        }

        return $staff->experiences->map(function ($exp) {
            $parts = [$exp->company ?? 'Unknown'];
            if ($exp->position) {
                $parts[] = $exp->position;
            }
            $from = $exp->from_date?->format('Y-m-d') ?? '?';
            $to = $exp->is_current ? 'Present' : ($exp->to_date?->format('Y-m-d') ?? '?');
            $parts[] = "{$from} to {$to}";

            return implode(', ', $parts);
        })->implode('; ');
    }

    protected function formatCertifications(Staff $staff): string
    {
        if ($staff->certifications->isEmpty()) {
            return '-';
        }

        return $staff->certifications->map(function ($cert) {
            $parts = [$cert->name];
            if ($cert->issuing_organization) {
                $parts[] = $cert->issuing_organization;
            }
            $from = $cert->issue_date?->format('Y-m-d') ?? '?';
            $to = $cert->expiry_date?->format('Y-m-d') ?? '?';
            $parts[] = "{$from} to {$to}";

            return implode(', ', $parts);
        })->implode('; ');
    }
}
