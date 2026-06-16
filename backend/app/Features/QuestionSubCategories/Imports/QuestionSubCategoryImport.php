<?php

namespace App\Features\QuestionSubCategories\Imports;

use App\Models\QuestionCategory;
use App\Models\QuestionSubCategory;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class QuestionSubCategoryImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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

        $name = $data['name'] ?? null;
        $code = $data['code'] ?? null;
        $parentCategoryCode = $data['parent_category_code'] ?? null;
        $description = $data['description'] ?? null;
        $order = $data['order'] ?? null;
        $isActive = $data['is_active'] ?? null;

        if (empty($code)) {
            Log::warning('QuestionSubCategoryImport: Skipping row - missing code', [
                'data' => $data,
            ]);

            return;
        }

        $parentCategory = null;
        if (! empty($parentCategoryCode)) {
            $parentCategory = QuestionCategory::where('code', $parentCategoryCode)->first();
            if (! $parentCategory) {
                Log::warning('QuestionSubCategoryImport: Skipping row - parent category not found', [
                    'code' => $code,
                    'parent_category_code' => $parentCategoryCode,
                ]);

                return;
            }
        }

        $subCategoryData = [
            'name' => $name,
            'code' => $code,
            'question_category_id' => $parentCategory?->id,
            'description' => $description,
            'order' => $order !== null && $order !== '' ? (int) $order : 0,
            'is_active' => filter_var($isActive ?? true, FILTER_VALIDATE_BOOLEAN),
        ];

        $subCategory = QuestionSubCategory::updateOrCreate(
            ['code' => $code],
            $subCategoryData
        );

        if ($subCategory->wasRecentlyCreated) {
            $this->importedCount++;
            Log::info('QuestionSubCategoryImport: Created sub-category', ['id' => $subCategory->id, 'code' => $subCategory->code]);
        } else {
            $this->updatedCount++;
            Log::info('QuestionSubCategoryImport: Updated sub-category', ['id' => $subCategory->id, 'code' => $subCategory->code]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50'],
            'parent_category_code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'order' => ['nullable', 'integer'],
            'is_active' => ['nullable'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'name' => 'Name',
            'code' => 'Code',
            'parent_category_code' => 'Parent Category Code',
            'description' => 'Description',
            'order' => 'Order',
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
