<?php

namespace App\Features\Classification\Imports;

use App\Models\Category;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class CategoryImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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

        $code = $data['code'] ?? null;
        $name = $data['name'] ?? null;
        $description = $data['description'] ?? null;
        $isActive = $data['is_active'] ?? null;

        if (empty($code)) {
            Log::warning('CategoryImport: Skipping row - missing code', [
                'data' => $data,
            ]);

            return;
        }

        $categoryData = [
            'code' => $code,
            'name' => $name,
            'description' => $description,
            'is_active' => filter_var($isActive ?? true, FILTER_VALIDATE_BOOLEAN),
        ];

        $category = Category::updateOrCreate(
            ['code' => $code],
            $categoryData
        );

        if ($category->wasRecentlyCreated) {
            $this->importedCount++;
            Log::info('CategoryImport: Created category', ['id' => $category->id, 'code' => $category->code]);
        } else {
            $this->updatedCount++;
            Log::info('CategoryImport: Updated category', ['id' => $category->id, 'code' => $category->code]);
        }
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'code' => 'Code',
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
