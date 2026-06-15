<?php

namespace App\Features\Zones\Imports;

use App\Models\Zone;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class ZoneImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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

        // WithHeadingRow converts "Zone Name" to "zone_name" (snake_case)
        // Keys in data: zone_name, zone_code, zone_level, parent_zone_name, description
        $name = $data['zone_name'] ?? null;
        $code = $data['zone_code'] ?? null;
        $level = $data['zone_level'] ?? null;
        $description = $data['description'] ?? null;
        $parentName = $data['parent_zone_name'] ?? null;

        // Skip row if required fields are empty
        if (empty($name) || empty($code) || empty($level)) {
            Log::warning('ZoneImport: Skipping row - missing required fields', [
                'name' => $name,
                'code' => $code,
                'level' => $level,
            ]);

            return;
        }

        $zoneData = [
            'name' => $name,
            'code' => $code,
            'level' => $level,
            'description' => $description,
        ];

        if (! empty($parentName)) {
            $parentZone = Zone::where('name', $parentName)->first();
            if ($parentZone) {
                $zoneData['parent_id'] = $parentZone->id;
            }
        }

        $zone = Zone::create($zoneData);
        $this->importedCount++;

        Log::info('ZoneImport: Created zone', ['id' => $zone->id, 'name' => $zone->name]);
    }

    public function rules(): array
    {
        // Keys match the Excel headers after WithHeadingRow converts them to snake_case
        // Excel "Zone Name" becomes "zone_name", "Zone Code" becomes "zone_code", etc.
        return [
            'zone_name' => ['required', 'string', 'max:255'],
            'zone_code' => ['required', 'string', 'max:50', 'unique:zones,code'],
            'zone_level' => ['required', 'string', 'in:region,district,sub_district'],
            'description' => ['nullable', 'string'],
            'parent_zone_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'zone_name' => 'Zone Name',
            'zone_code' => 'Zone Code',
            'zone_level' => 'Zone Level',
            'description' => 'Description',
            'parent_zone_name' => 'Parent Zone Name',
        ];
    }

    /**
     * Get the count of successfully imported records.
     */
    public function getImportedCount(): int
    {
        return $this->importedCount;
    }
}
