<?php

namespace App\Features\Medications\Imports;

use App\Models\Medication;
use App\Models\PhcCenter;
use App\Models\PhcMedication;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class PhcMedicationImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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

        $centerName = $data['phc_center_name'] ?? null;
        $medicationName = $data['medication_name'] ?? null;
        $recommendedQuantity = $data['recommended_quantity'] ?? null;
        $currentStock = $data['current_stock'] ?? null;
        $allocationLocation = $data['allocation_location'] ?? null;
        $notes = $data['notes'] ?? null;

        // Skip row if required fields are empty
        if (empty($centerName) || empty($medicationName) || empty($recommendedQuantity)) {
            Log::warning('PhcMedicationImport: Skipping row - missing required fields', [
                'phc_center_name' => $centerName,
                'medication_name' => $medicationName,
                'recommended_quantity' => $recommendedQuantity,
            ]);

            $this->skippedCount++;

            return;
        }

        // Resolve PHC Center by name (case-insensitive)
        $phcCenter = PhcCenter::whereRaw('LOWER(name) = ?', [strtolower($centerName)])->first();

        if (! $phcCenter) {
            Log::warning('PhcMedicationImport: Skipping row - PHC center not found', [
                'phc_center_name' => $centerName,
            ]);

            $this->skippedCount++;

            return;
        }

        // Resolve Medication by name (case-insensitive)
        $medication = Medication::whereRaw('LOWER(name) = ?', [strtolower($medicationName)])->first();

        if (! $medication) {
            Log::warning('PhcMedicationImport: Skipping row - medication not found', [
                'medication_name' => $medicationName,
            ]);

            $this->skippedCount++;

            return;
        }

        $query = PhcMedication::where('phc_center_id', $phcCenter->id)
            ->where('medication_id', $medication->id);

        $trimmedAllocationLocation = $allocationLocation ? trim($allocationLocation) : null;

        if ($trimmedAllocationLocation === null || $trimmedAllocationLocation === '') {
            $query->whereNull('allocation_location');
        } else {
            $query->where('allocation_location', $trimmedAllocationLocation);
        }

        $existing = $query->first();

        if ($existing) {
            $existing->update([
                'recommended_quantity' => $recommendedQuantity,
                'current_stock' => $currentStock ?: null,
                'notes' => $notes ?: null,
            ]);
            $this->importedCount++;

            Log::info('PhcMedicationImport: Updated existing PHC medication link', [
                'phc_center_name' => $centerName,
                'medication_name' => $medicationName,
                'allocation_location' => $allocationLocation ?: null,
                'phc_medication_id' => $existing->id,
            ]);
        } else {
            PhcMedication::create([
                'phc_center_id' => $phcCenter->id,
                'medication_id' => $medication->id,
                'recommended_quantity' => $recommendedQuantity,
                'current_stock' => $currentStock ?: null,
                'allocation_location' => $trimmedAllocationLocation,
                'notes' => $notes ?: null,
                'is_active' => true,
            ]);
            $this->importedCount++;

            Log::info('PhcMedicationImport: Created PHC medication link', [
                'phc_center_name' => $centerName,
                'medication_name' => $medicationName,
                'allocation_location' => $allocationLocation ?: null,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'phc_center_name' => ['required', 'string'],
            'medication_name' => ['required', 'string'],
            'recommended_quantity' => ['required', 'numeric', 'min:0'],
            'current_stock' => ['nullable', 'numeric', 'min:0'],
            'allocation_location' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'phc_center_name' => 'PHC Center Name',
            'medication_name' => 'Medication Name',
            'recommended_quantity' => 'Recommended Quantity',
            'current_stock' => 'Current Stock',
            'allocation_location' => 'Allocation Location',
            'notes' => 'Notes',
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
