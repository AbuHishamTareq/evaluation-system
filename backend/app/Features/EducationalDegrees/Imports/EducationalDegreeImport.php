<?php

namespace App\Features\EducationalDegrees\Imports;

use App\Models\EducationalDegree;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Row;

class EducationalDegreeImport implements OnEachRow, WithHeadingRow, WithStartRow
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

        $name = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '');
        $isActive = $data['is_active'] ?? null;

        if (empty($name)) {
            return;
        }

        if (EducationalDegree::where('name', $name)->exists()) {
            Log::warning('EducationalDegreeImport: Skipping duplicate name', [
                'name' => $name,
            ]);

            return;
        }

        try {
            EducationalDegree::create([
                'name' => $name,
                'description' => $description ?: null,
                'is_active' => $this->parseBoolean($isActive),
            ]);

            $this->importedCount++;

            Log::info('EducationalDegreeImport: Created educational degree', [
                'name' => $name,
            ]);
        } catch (\Exception $e) {
            Log::error('EducationalDegreeImport: Failed to create educational degree', [
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
