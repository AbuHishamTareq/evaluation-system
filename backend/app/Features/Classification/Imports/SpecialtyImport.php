<?php

namespace App\Features\Classification\Imports;

use App\Models\Field;
use App\Models\Specialty;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class SpecialtyImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
{
    use Importable;

    protected int $importedCount = 0;

    protected int $updatedCount = 0;

    public function startRow(): int
    {
        return 2;
    }

    public function onRow(Row $row): void
    {
        $data = $row->toArray();

        $fieldName = $data['field_name'] ?? null;
        $name = $data['name'] ?? null;
        $description = $data['description'] ?? null;
        $isActive = $data['is_active'] ?? null;

        if (empty($name) || empty($fieldName)) {
            Log::warning('SpecialtyImport: Skipping row - missing required fields', [
                'name' => $name,
                'field_name' => $fieldName,
            ]);

            return;
        }

        $field = Field::where('name', $fieldName)->first();
        if (! $field) {
            Log::warning('SpecialtyImport: Skipping row - field not found', [
                'field_name' => $fieldName,
            ]);

            return;
        }

        $specialtyData = [
            'field_id' => $field->id,
            'name' => $name,
            'description' => $description,
            'is_active' => filter_var($isActive ?? true, FILTER_VALIDATE_BOOLEAN),
        ];

        $specialty = Specialty::updateOrCreate(
            [
                'field_id' => $field->id,
                'name' => $name,
            ],
            $specialtyData
        );

        if ($specialty->wasRecentlyCreated) {
            $this->importedCount++;
            Log::info('SpecialtyImport: Created specialty', ['id' => $specialty->id, 'name' => $specialty->name]);
        } else {
            $this->updatedCount++;
            Log::info('SpecialtyImport: Updated specialty', ['id' => $specialty->id, 'name' => $specialty->name]);
        }
    }

    public function rules(): array
    {
        return [
            'field_name' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'field_name' => 'Field Name',
            'name' => 'Name',
            'description' => 'Description',
            'is_active' => 'Is Active',
        ];
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getUpdatedCount(): int
    {
        return $this->updatedCount;
    }
}
