<?php

namespace App\Features\Professionals\Imports;

use App\Models\Professional;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Row;

class ProfessionalImport implements OnEachRow, WithHeadingRow, WithStartRow
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

        $name = trim($data['role_name'] ?? '');
        $description = trim($data['description'] ?? '');
        $isActive = $data['is_active'] ?? null;

        if (empty($name)) {
            return;
        }

        if (Professional::where('name', $name)->exists()) {
            Log::warning('ProfessionalImport: Skipping duplicate name', [
                'name' => $name,
            ]);

            return;
        }

        try {
            Professional::create([
                'name' => $name,
                'description' => $description ?: null,
                'is_active' => $this->parseBoolean($isActive),
            ]);

            $this->importedCount++;

            Log::info('ProfessionalImport: Created professional', [
                'name' => $name,
            ]);
        } catch (\Exception $e) {
            Log::error('ProfessionalImport: Failed to create professional', [
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
