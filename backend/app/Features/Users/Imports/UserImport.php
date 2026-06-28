<?php

namespace App\Features\Users\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class UserImport implements ToModel, WithHeadingRow, WithValidation
{
    use Importable;

    protected int $importedCount = 0;

    public function model(array $row): ?User
    {
        $email = trim($row['email'] ?? '');

        if (empty($email)) {
            return null;
        }

        if (User::where('email', $email)->exists()) {
            Log::warning('UserImport: Skipping duplicate email', [
                'email' => $email,
            ]);

            return null;
        }

        $this->importedCount++;

        return new User([
            'name' => trim($row['name'] ?? ''),
            'email' => $email,
            'password' => bcrypt(Str::password(16)),
            'role' => isset($row['role']) ? trim($row['role']) : 'staff',
            'employee_id' => isset($row['employee_id']) ? trim($row['employee_id']) : null,
            'is_active' => $this->parseBoolean($row['is_active'] ?? true),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')],
            'role' => ['nullable', 'string', Rule::in(['admin', 'manager', 'evaluator', 'staff'])],
            'employee_id' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'name' => 'Name',
            'email' => 'Email Address',
            'role' => 'Role',
            'employee_id' => 'Employee ID',
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
}
