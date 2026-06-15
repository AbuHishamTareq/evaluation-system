<?php

namespace App\Features\ClinicAssignments\Imports;

use App\Models\ClinicAssignment;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Row;

class ClinicAssignmentImport implements OnEachRow, WithHeadingRow, WithStartRow
{
    use Importable;

    protected int $importedCount = 0;

    public function startRow(): int
    {
        return 2;
    }

    public function onRow(Row $row): void
    {
        $data = $row->toArray();

        $name = trim($data['clinic_assignment'] ?? '');
        $description = trim($data['description'] ?? '');
        $isActive = $data['is_active'] ?? null;

        if (empty($name)) {
            return;
        }

        if (ClinicAssignment::where('name', $name)->exists()) {
            Log::warning('ClinicAssignmentImport: Skipping duplicate name', [
                'name' => $name,
            ]);

            return;
        }

        try {
            ClinicAssignment::create([
                'name' => $name,
                'description' => $description ?: null,
                'is_active' => $this->parseBoolean($isActive),
            ]);

            $this->importedCount++;

            Log::info('ClinicAssignmentImport: Created clinic assignment', [
                'name' => $name,
            ]);
        } catch (\Exception $e) {
            Log::error('ClinicAssignmentImport: Failed to create clinic assignment', [
                'name' => $name,
                'error' => $e->getMessage(),
            ]);
        }
    }

    protected function parseBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_null($value)) {
            return true;
        }

        $value = strtolower((string) $value);

        return in_array($value, ['true', '1', 'yes'], true);
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }
}
