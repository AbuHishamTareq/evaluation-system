<?php

namespace App\Features\Medications\Imports;

use App\Models\Medication;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class MedicationImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
{
    use Importable;

    /**
     * Count of successfully imported records.
     */
    protected int $importedCount = 0;

    /**
     * Count of skipped records.
     */
    protected int $skippedCount = 0;

    /**
     * Validation errors.
     */
    protected array $errors = [];

    /**
     * Excel row number where data starts (row 1 = headers, row 2 = first data).
     */
    public function startRow(): int
    {
        return 2;
    }

    public function onRow(Row $row): void
    {
        $data = $row->toArray();

        $name = $data['medication_name'] ?? null;
        $strength = $data['strength'] ?? null;
        $form = $data['form'] ?? null;
        $unit = $data['unit'] ?? null;
        $category = $data['category'] ?? null;
        $isActive = $data['is_active'] ?? true;

        // Skip row if medication_name is empty
        if (empty($name)) {
            Log::warning('MedicationImport: Skipping row - missing medication name', [
                'medication_name' => $name,
            ]);

            $this->skippedCount++;

            return;
        }

        // Check if medication with same name exists (case-insensitive)
        $existingMedication = Medication::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
        if ($existingMedication) {
            Log::warning('MedicationImport: Skipping row - medication already exists', [
                'name' => $name,
            ]);

            $this->skippedCount++;

            return;
        }

        $medicationData = [
            'name' => $name,
            'strength' => $strength ?: null,
            'form' => $form ?: null,
            'unit' => $unit ?: null,
            'category' => $category ?: null,
            'is_active' => $this->normalizeBoolean($isActive),
        ];

        Medication::create($medicationData);
        $this->importedCount++;

        Log::info('MedicationImport: Created medication', [
            'name' => $name,
        ]);
    }

    protected function normalizeBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_numeric($value)) {
            return (bool) $value;
        }

        if (is_string($value)) {
            return in_array(strtolower(trim($value)), ['yes', 'true', '1', 'active']);
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'medication_name' => ['required', 'string', 'max:255'],
            'strength' => ['nullable', 'string', 'max:100'],
            'form' => ['nullable', 'string', 'max:50'],
            'unit' => ['nullable', 'string', 'max:50'],
            'category' => ['nullable', 'string', 'max:50'],
            'is_active' => ['nullable', 'in:1,0'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'medication_name' => 'Medication Name',
            'strength' => 'Strength',
            'form' => 'Form',
            'unit' => 'Unit',
            'category' => 'Category',
            'is_active' => 'Is Active',
        ];
    }

    /**
     * Get the count of successfully imported records.
     */
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    /**
     * Get the count of skipped records.
     */
    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    /**
     * Get validation errors.
     */
    public function getErrors(): array
    {
        return $this->errors;
    }
}
