<?php

namespace App\Features\TeamCodes\Imports;

use App\Models\PhcCenter;
use App\Models\TeamCode;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Row;

class TeamCodeImport implements OnEachRow, WithHeadingRow, WithStartRow
{
    use Importable;

    /**
     * Count of successfully imported records.
     */
    protected int $importedCount = 0;

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

        $code = trim($data['code'] ?? '');
        $description = trim($data['description'] ?? '');
        $isActive = $data['is_active'] ?? null;
        $centerName = trim($data['center_name'] ?? '');

        // Skip rows without a code
        if (empty($code)) {
            return;
        }

        // Skip rows that look like reference notes (contain colons, slashes, or are very long)
        if (str_contains($code, ':') || str_contains($code, '/') || strlen($code) > 50) {
            return;
        }

        // Check if code already exists
        if (TeamCode::where('code', $code)->exists()) {
            Log::warning('TeamCodeImport: Skipping duplicate code', [
                'code' => $code,
            ]);

            return;
        }

        try {
            $teamCodeData = [
                'code' => $code,
                'description' => $description ?: null,
                'is_active' => $this->parseBoolean($isActive),
            ];

            // Lookup center by name
            if (! empty($centerName)) {
                $center = PhcCenter::where('name', $centerName)->first();
                if ($center) {
                    $teamCodeData['center_id'] = $center->id;
                }
            }

            $teamCode = TeamCode::create($teamCodeData);
            $this->importedCount++;

            Log::info('TeamCodeImport: Created team code', [
                'code' => $code,
                'id' => $teamCode->id,
            ]);
        } catch (\Exception $e) {
            Log::error('TeamCodeImport: Failed to create team code', [
                'code' => $code,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Parse various boolean representations into a proper boolean.
     */
    protected function parseBoolean(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }

        if (is_null($value)) {
            return true; // Default to active
        }

        $value = strtolower((string) $value);

        return in_array($value, ['true', '1', 'yes'], true);
    }

    /**
     * Get the count of successfully imported records.
     */
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }
}
