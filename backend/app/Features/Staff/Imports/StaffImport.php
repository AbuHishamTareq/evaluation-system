<?php

namespace App\Features\Staff\Imports;

use App\Models\ClinicAssignment;
use App\Models\Department;
use App\Models\PhcCenter;
use App\Models\Professional;
use App\Models\Staff;
use App\Models\TeamCode;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithFormatData;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class StaffImport implements ToModel, WithFormatData, WithHeadingRow, WithValidation
{
    use Importable;

    protected int $importedCount = 0;

    /**
     * Note: Education (educational degrees), experience, and certification data
     * cannot be imported via CSV due to their one-to-many relationship structure.
     * Please import those separately through the API or UI forms.
     */
    public function model(array $row): ?Staff
    {
        $employeeId = trim($row['staff_id'] ?? $row['employee_id'] ?? '');

        if (empty($employeeId)) {
            return null;
        }

        if (Staff::where('employee_id', $employeeId)->exists()) {
            Log::warning('StaffImport: Skipping duplicate employee_id', [
                'employee_id' => $employeeId,
            ]);

            return null;
        }

        $this->importedCount++;

        return new Staff([
            'employee_id' => $employeeId,
            'first_name' => trim($row['first_name'] ?? ''),
            'middle_name' => isset($row['middle_name']) ? trim($row['middle_name']) : null,
            'last_name' => trim($row['last_name'] ?? ''),
            'email' => isset($row['email']) ? trim($row['email']) : null,
            'phone' => isset($row['phone']) ? trim($row['phone']) : null,
            'mobile' => isset($row['mobile']) ? trim($row['mobile']) : null,
            'gender' => isset($row['gender']) ? trim($row['gender']) : null,
            'date_of_birth' => isset($row['date_of_birth']) ? trim($row['date_of_birth']) : null,
            'nationality' => isset($row['nationality']) ? trim($row['nationality']) : null,
            'national_id' => isset($row['national_id']) ? trim($row['national_id']) : null,
            'address' => isset($row['address']) ? trim($row['address']) : null,
            'notes' => isset($row['notes']) ? trim($row['notes']) : null,
            'phc_center_id' => isset($row['phc_center']) && ! empty($row['phc_center']) ? PhcCenter::where('name', trim($row['phc_center']))->value('id') : null,
            'department_id' => isset($row['department']) && ! empty($row['department']) ? Department::where('name', trim($row['department']))->value('id') : null,
            'professional_id' => isset($row['professional']) && ! empty($row['professional']) ? Professional::where('name', trim($row['professional']))->value('id') : null,
            'clinic_assignment_id' => isset($row['clinic_assignment']) && ! empty($row['clinic_assignment']) ? ClinicAssignment::where('name', trim($row['clinic_assignment']))->value('id') : null,
            'employment_type' => isset($row['employment_type']) ? $this->mapEmploymentType(trim($row['employment_type'])) : 'full_time',
            'hire_date' => isset($row['hire_date']) ? trim($row['hire_date']) : null,
            'termination_date' => isset($row['termination_date']) ? trim($row['termination_date']) : null,
            'is_care_provider' => $this->parseBoolean($row['is_care_provider'] ?? false),
            'team_code_id' => isset($row['team']) && ! empty($row['team']) ? $this->resolveTeamCodeId(trim($row['team'])) : null,
            'scfhs_registration_no' => isset($row['scfhs_registration_no']) ? trim($row['scfhs_registration_no']) : null,
            'scfhs_issue_date' => isset($row['scfhs_issue_date']) ? trim($row['scfhs_issue_date']) : null,
            'scfhs_expiry_date' => isset($row['scfhs_expiry_date']) ? trim($row['scfhs_expiry_date']) : null,
            'malpractice_insurance_no' => isset($row['malpractice_insurance_no']) ? trim($row['malpractice_insurance_no']) : null,
            'malpractice_issue_date' => isset($row['malpractice_issue_date']) ? trim($row['malpractice_issue_date']) : null,
            'malpractice_expiry_date' => isset($row['malpractice_expiry_date']) ? trim($row['malpractice_expiry_date']) : null,
            'status' => isset($row['status']) ? trim($row['status']) : 'active',
            'is_active' => $this->parseBoolean($row['is_active'] ?? true),
        ]);
    }

    /**
     * Transform row data before validation runs.
     *
     * This handles type coercion for values that Excel may return as
     * floats (e.g., National ID, phone numbers) or Excel serial date
     * numbers so validation rules like `string` and `date` receive
     * the correct types.
     */
    public function prepareForValidation(array $row, int $rowIndex): array
    {
        // Fields that should always be treated as strings, even if Excel returns them as numbers
        $stringFields = [
            'staff_id', 'employee_id', 'first_name', 'middle_name', 'last_name',
            'email', 'phone', 'mobile', 'gender', 'nationality', 'national_id',
            'address', 'notes', 'phc_center', 'department', 'professional',
            'clinic_assignment', 'employment_type', 'team',
            'scfhs_registration_no', 'malpractice_insurance_no',
            'status',
        ];

        // Date fields that might arrive as Excel serial numbers
        $dateFields = [
            'date_of_birth', 'hire_date', 'termination_date',
            'scfhs_issue_date', 'scfhs_expiry_date',
            'malpractice_issue_date', 'malpractice_expiry_date',
        ];

        foreach ($row as $key => $value) {
            // Cast numeric values to strings for known string fields
            if (is_numeric($value) && ! is_bool($value) && in_array($key, $stringFields, true)) {
                $row[$key] = (string) $value;
            }

            // Convert DateTime/Carbon instances to date strings for date fields
            if ($value instanceof \DateTimeInterface) {
                $row[$key] = $value->format('Y-m-d');
            }

            // Convert Excel serial date numbers (e.g. 46767 → '2028-01-15')
            // These can arrive as float (46767.0) or as string when formatted as 'General' ('46767')
            if (in_array($key, $dateFields, true) && ! empty($value)) {
                $numericVal = is_numeric($value) ? $value : (is_string($value) && is_numeric($value) ? $value + 0 : false);
                if ($numericVal !== false && $numericVal > 40000 && $numericVal < 200000) {
                    try {
                        $dateTime = ExcelDate::excelToDateTimeObject($numericVal);
                        $row[$key] = $dateTime->format('Y-m-d');
                    } catch (\Exception $e) {
                        // If conversion fails, leave the original value
                    }
                }
            }

            // Trim string values
            if (is_string($row[$key] ?? null)) {
                $row[$key] = trim($row[$key]);
            }
        }

        return $row;
    }

    public function rules(): array
    {
        return [
            'staff_id' => ['required', 'string', 'max:255', Rule::unique('staff', 'employee_id')],
            'employee_id' => ['nullable', 'string', 'max:255', Rule::unique('staff', 'employee_id')],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', Rule::unique('staff', 'email')],
            'phone' => ['nullable', 'string', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
            'date_of_birth' => ['nullable', 'date'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'national_id' => ['nullable', 'max:255'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'phc_center' => ['nullable', 'string', 'exists:phc_centers,name'],
            'department' => ['nullable', 'string', 'exists:departments,name'],
            'professional' => ['nullable', 'string', 'exists:professionals,name'],
            'clinic_assignment' => ['nullable', 'string', 'exists:clinic_assignments,name'],
            'employment_type' => ['nullable', 'string', Rule::in(['Full Time', 'Part Time', 'Contract', 'Volunteer'])],
            'hire_date' => ['nullable', 'date'],
            'termination_date' => ['nullable', 'date'],
            'is_care_provider' => ['nullable'],
            'team' => ['nullable', 'string'],
            'scfhs_registration_no' => ['nullable', 'string', 'max:255'],
            'scfhs_issue_date' => ['nullable', 'date'],
            'scfhs_expiry_date' => ['nullable', 'date'],
            'malpractice_insurance_no' => ['nullable', 'string', 'max:255'],
            'malpractice_issue_date' => ['nullable', 'date'],
            'malpractice_expiry_date' => ['nullable', 'date'],
            'status' => ['nullable', 'string', Rule::in(['active', 'inactive', 'suspended', 'terminated'])],
            'is_active' => ['nullable'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'staff_id' => 'Staff ID',
            'employee_id' => 'Employee ID',
            'first_name' => 'First Name',
            'middle_name' => 'Middle Name',
            'last_name' => 'Last Name',
            'email' => 'Email Address',
            'phone' => 'Phone Number',
            'mobile' => 'Mobile Number',
            'gender' => 'Gender',
            'date_of_birth' => 'Date of Birth',
            'nationality' => 'Nationality',
            'national_id' => 'National ID',
            'address' => 'Address',
            'notes' => 'Notes',
            'phc_center' => 'PHC Center',
            'department' => 'Department',
            'professional' => 'Professional',
            'clinic_assignment' => 'Clinic Assignment',
            'employment_type' => 'Employment Type',
            'hire_date' => 'Hire Date',
            'termination_date' => 'Termination Date',
            'is_care_provider' => 'Is Care Provider',
            'team' => 'Team',
            'scfhs_registration_no' => 'SCFHS Registration No',
            'scfhs_issue_date' => 'SCFHS Issue Date',
            'scfhs_expiry_date' => 'SCFHS Expiry Date',
            'malpractice_insurance_no' => 'Malpractice Insurance No',
            'malpractice_issue_date' => 'Malpractice Issue Date',
            'malpractice_expiry_date' => 'Malpractice Expiry Date',
            'status' => 'Status',
            'is_active' => 'Is Active',
        ];
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    protected function parseBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_null($value)) {
            return true;
        }

        if (is_numeric($value)) {
            return (int) $value === 1;
        }

        $value = strtolower((string) $value);

        return in_array($value, ['true', '1', 'yes'], true);
    }

    protected function mapEmploymentType(string $value): string
    {
        $map = [
            'Full Time' => 'full_time',
            'Part Time' => 'part_time',
            'Contract' => 'contract',
            'Volunteer' => 'volunteer',
        ];

        return $map[$value] ?? $value;
    }

    /**
     * Resolve a team code to its database ID, creating it if it does not exist.
     */
    protected function resolveTeamCodeId(string $code): ?int
    {
        $team = TeamCode::where('code', $code)->first();

        if ($team) {
            return $team->id;
        }

        // Auto-create the team code so the import doesn't fail on missing teams
        try {
            $team = TeamCode::create([
                'code' => $code,
                'description' => 'Auto-created from staff import',
                'is_active' => true,
            ]);

            Log::info('StaffImport: Auto-created team code', [
                'code' => $code,
                'id' => $team->id,
            ]);

            return $team->id;
        } catch (\Exception $e) {
            Log::error('StaffImport: Failed to auto-create team code', [
                'code' => $code,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
