<?php

namespace App\Features\Departments\Imports;

use App\Models\Department;
use App\Models\PhcCenter;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Row;

class DepartmentImport implements OnEachRow, WithHeadingRow, WithStartRow
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
        $centerName = trim($data['center_name'] ?? '');
        $isActive = $data['is_active'] ?? null;

        if (empty($name)) {
            return;
        }

        if (empty($centerName)) {
            Log::warning('DepartmentImport: Skipping row — center_name is required', [
                'name' => $name,
            ]);

            return;
        }

        $center = PhcCenter::where('name', $centerName)->first();

        if (! $center) {
            Log::warning('DepartmentImport: Skipping row — center not found', [
                'name' => $name,
                'center_name' => $centerName,
            ]);

            return;
        }

        if (Department::where('name', $name)->exists()) {
            Log::warning('DepartmentImport: Skipping duplicate name', [
                'name' => $name,
            ]);

            return;
        }

        try {
            Department::create([
                'name' => $name,
                'description' => $description ?: null,
                'center_id' => $center->id,
                'is_active' => $this->parseBoolean($isActive),
            ]);

            $this->importedCount++;

            Log::info('DepartmentImport: Created department', [
                'name' => $name,
                'center_id' => $center->id,
            ]);
        } catch (\Exception $e) {
            Log::error('DepartmentImport: Failed to create department', [
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
