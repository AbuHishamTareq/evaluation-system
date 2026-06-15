<?php

namespace App\Features\Centers\Imports;

use App\Models\PhcCenter;
use App\Models\Zone;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class CenterImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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

        // User-friendly headers mapping:
        // center_name, center_code, zone_name, classification, address,
        // phone, email, is_active, notes, latitude, longitude, region, zone

        $name = $data['center_name'] ?? null;
        $code = $data['center_code'] ?? null;
        $zoneName = $data['zone_name'] ?? null;
        $classification = $data['classification'] ?? 'primary';
        $address = $data['address'] ?? null;
        $phone = $data['phone'] ?? null;
        $email = $data['email'] ?? null;
        $isActive = $data['is_active'] ?? true;
        $notes = $data['notes'] ?? null;
        $latitude = $data['latitude'] ?? null;
        $longitude = $data['longitude'] ?? null;
        $region = $data['region'] ?? null;
        $zone = $data['zone'] ?? null;

        // Skip row if required fields are empty
        if (empty($name) || empty($code)) {
            Log::warning('CenterImport: Skipping row - missing required fields', [
                'name' => $name,
                'code' => $code,
            ]);

            $this->skippedCount++;

            return;
        }

        // Check if code already exists
        $existingCenter = PhcCenter::where('code', $code)->first();
        if ($existingCenter) {
            Log::warning('CenterImport: Skipping row - code already exists', [
                'code' => $code,
            ]);

            $this->skippedCount++;

            return;
        }

        $centerData = [
            'name' => $name,
            'code' => $code,
            'classification' => $this->normalizeClassification($classification),
            'address' => $address,
            'phone' => $phone,
            'email' => $email,
            'is_active' => $this->normalizeBoolean($isActive),
            'notes' => $notes,
            'latitude' => $latitude ? (float) $latitude : null,
            'longitude' => $longitude ? (float) $longitude : null,
            'region' => $region,
            'zone' => $zone,
        ];

        // Resolve zone by name - try exact match first, then case-insensitive match
        if (! empty($zoneName)) {
            // First try exact match
            $zone = Zone::where('name', $zoneName)->first();

            // If not found, try case-insensitive match
            if (! $zone) {
                $zone = Zone::whereRaw('LOWER(name) = ?', [strtolower($zoneName)])->first();
            }

            // If still not found, try partial match (for sub-districts within districts)
            if (! $zone) {
                $zone = Zone::where('name', 'like', "%{$zoneName}%")->first();
            }

            if ($zone) {
                $centerData['zone_id'] = $zone->id;
            }
        }

        PhcCenter::create($centerData);
        $this->importedCount++;

        Log::info('CenterImport: Created center', [
            'code' => $code,
            'name' => $name,
        ]);
    }

    protected function normalizeClassification(?string $classification): string
    {
        if (empty($classification)) {
            return 'primary';
        }

        $validClassifications = ['primary', 'secondary', 'specialized', 'community'];
        $normalized = strtolower(trim($classification));

        if (in_array($normalized, $validClassifications)) {
            return $normalized;
        }

        // Map old technical values and synonyms to new classification values
        $mappings = [
            // Old technical values
            'level_1' => 'primary',
            'level_2_plus' => 'secondary',
            'outreach_post' => 'community',
            // Variations
            'level 1' => 'primary',
            'level1' => 'primary',
            'level 2+' => 'secondary',
            'level 2 plus' => 'secondary',
            'level2+' => 'secondary',
            'level2plus' => 'secondary',
            'outreach' => 'community',
            'outreach post' => 'community',
            // Additional synonyms
            'primary health center' => 'primary',
            'primary health centre' => 'primary',
            'health center' => 'primary',
            'health centre' => 'primary',
            'hospital' => 'secondary',
            'clinic' => 'primary',
        ];

        return $mappings[$normalized] ?? 'primary';
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
        // Keys match the Excel headers after WithHeadingRow converts them to snake_case
        // Accept both technical values (outreach_post, level_1, level_2_plus) and user-friendly values (primary, secondary, specialized, community)
        return [
            'center_name' => ['required', 'string', 'max:255'],
            'center_code' => ['required', 'string', 'max:50', 'unique:phc_centers,code'],
            'zone_name' => ['nullable', 'string', 'max:255'],
            'classification' => [
                'nullable',
                'string',
                'regex:/^(primary|secondary|specialized|community|level_1|level_2_plus|outreach_post|level 1|level1|level 2\+|level2\+|level 2 plus|outreach|outreach post)$/i',
            ],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['nullable', 'string', 'in:yes,no,true,false,1,0,Yes,No,TRUE,FALSE'],
            'notes' => ['nullable', 'string'],
            'latitude' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'longitude' => ['nullable', 'numeric', 'min:-180', 'max:180'],
            'region' => ['nullable', 'string', 'max:255'],
            'zone' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'center_name' => 'Center Name',
            'center_code' => 'Center Code',
            'zone_name' => 'Zone Name',
            'classification' => 'Classification',
            'address' => 'Address',
            'phone' => 'Phone',
            'email' => 'Email',
            'is_active' => 'Is Active',
            'notes' => 'Notes',
            'latitude' => 'Latitude',
            'longitude' => 'Longitude',
            'region' => 'Region',
            'zone' => 'Zone',
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
