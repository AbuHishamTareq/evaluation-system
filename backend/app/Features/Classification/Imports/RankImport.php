<?php

namespace App\Features\Classification\Imports;

use App\Models\Rank;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\Importable;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Row;

class RankImport implements OnEachRow, WithHeadingRow, WithStartRow, WithValidation
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
        $description = $data['description'] ?? null;
        $level = $data['level'] ?? null;
        $isActive = $data['is_active'] ?? null;

        if (empty($name)) {
            Log::warning('RankImport: Skipping row - missing name', [
                'data' => $data,
            ]);

            return;
        }

        $rankData = [
            'name' => $name,
            'description' => $description,
            'level' => (int) ($level ?? 0),
            'is_active' => filter_var($isActive ?? true, FILTER_VALIDATE_BOOLEAN),
        ];

        $rank = Rank::updateOrCreate(
            ['name' => $name],
            $rankData
        );

        if ($rank->wasRecentlyCreated) {
            $this->importedCount++;
            Log::info('RankImport: Created rank', ['id' => $rank->id, 'name' => $rank->name]);
        } else {
            $this->updatedCount++;
            Log::info('RankImport: Updated rank', ['id' => $rank->id, 'name' => $rank->name]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'level' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable'],
        ];
    }

    public function customValidationAttributes(): array
    {
        return [
            'name' => 'Name',
            'description' => 'Description',
            'level' => 'Level',
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
