<?php

namespace App\Features\Classification\Imports;

use App\Models\Category;
use App\Models\ClassificationMapping;
use App\Models\Field;
use App\Models\Rank;
use App\Models\Specialty;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class ClassificationMappingImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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
        $specialtyName = $data['specialty_name'] ?? null;
        $rankName = $data['rank_name'] ?? null;
        $categoryCode = $data['category_code'] ?? null;

        if (empty($fieldName) || empty($specialtyName) || empty($rankName) || empty($categoryCode)) {
            Log::warning('ClassificationMappingImport: Skipping row - missing required fields', [
                'data' => $data,
            ]);

            return;
        }

        $field = Field::where('name', $fieldName)->first();
        if (! $field) {
            Log::warning('ClassificationMappingImport: Skipping row - field not found', [
                'field_name' => $fieldName,
            ]);

            return;
        }

        $specialty = Specialty::where('name', $specialtyName)->where('field_id', $field->id)->first();
        if (! $specialty) {
            Log::warning('ClassificationMappingImport: Skipping row - specialty not found', [
                'specialty_name' => $specialtyName,
                'field_id' => $field->id,
            ]);

            return;
        }

        $rank = Rank::where('name', $rankName)->first();
        if (! $rank) {
            Log::warning('ClassificationMappingImport: Skipping row - rank not found', [
                'rank_name' => $rankName,
            ]);

            return;
        }

        $category = Category::where('code', $categoryCode)->first();
        if (! $category) {
            Log::warning('ClassificationMappingImport: Skipping row - category not found', [
                'category_code' => $categoryCode,
            ]);

            return;
        }

        $mapping = ClassificationMapping::updateOrCreate(
            [
                'field_id' => $field->id,
                'specialty_id' => $specialty->id,
                'rank_id' => $rank->id,
            ],
            [
                'category_id' => $category->id,
            ]
        );

        if ($mapping->wasRecentlyCreated) {
            $this->importedCount++;
            Log::info('ClassificationMappingImport: Created mapping', [
                'field_id' => $field->id,
                'specialty_id' => $specialty->id,
                'rank_id' => $rank->id,
                'category_id' => $category->id,
            ]);
        } else {
            $this->updatedCount++;
            Log::info('ClassificationMappingImport: Updated mapping', [
                'field_id' => $field->id,
                'specialty_id' => $specialty->id,
                'rank_id' => $rank->id,
                'category_id' => $category->id,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'field_name' => ['required', 'string', 'max:255'],
            'specialty_name' => ['required', 'string', 'max:255'],
            'rank_name' => ['required', 'string', 'max:255'],
            'category_code' => ['required', 'string', 'max:50'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'field_name' => 'Field Name',
            'specialty_name' => 'Specialty Name',
            'rank_name' => 'Rank Name',
            'category_code' => 'Category Code',
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
