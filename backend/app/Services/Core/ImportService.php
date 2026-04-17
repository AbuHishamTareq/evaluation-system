<?php

namespace App\Services\Core;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class ImportService
{
    public function processFile(UploadedFile $file, array $columnMapping): Collection
    {
        $mimeType = $file->getMimeType();
        $extension = $file->getClientOriginalExtension();

        if ($this->isCsv($mimeType, $extension)) {
            return $this->processCsv($file, $columnMapping);
        }

        if ($this->isExcel($mimeType, $extension)) {
            return $this->processExcel($file, $columnMapping);
        }

        throw new \Exception('Unsupported file format. Only CSV and Excel files are allowed.');
    }

    protected function isCsv(string $mimeType, string $extension): bool
    {
        return in_array($mimeType, ['text/csv', 'text/plain']) || $extension === 'csv';
    }

    protected function isExcel(string $mimeType, string $extension): bool
    {
        return in_array($mimeType, [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]) || in_array($extension, ['xls', 'xlsx']);
    }

    public function processCsv(UploadedFile $file, array $columnMapping): Collection
    {
        $data = collect();
        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle);

        if (! $headers) {
            return $data;
        }

        $mappedHeaders = [];
        foreach ($headers as $index => $header) {
            $header = trim($header);
            if (isset($columnMapping[$header])) {
                $mappedHeaders[$index] = $columnMapping[$header];
            } elseif (isset($columnMapping[strtolower($header)])) {
                $mappedHeaders[$index] = $columnMapping[strtolower($header)];
            }
        }

        while (($row = fgetcsv($handle)) !== false) {
            $item = [];
            foreach ($mappedHeaders as $index => $field) {
                $item[$field] = $row[$index] ?? null;
            }
            $data->push($item);
        }

        fclose($handle);

        return $data;
    }

    public function processExcel(UploadedFile $file, array $columnMapping): Collection
    {
        $data = collect();

        $reader = IOFactory::createReaderForFile($file->getRealPath());
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();

        // Get headers from first row
        $highestRow = $worksheet->getHighestRow();
        $highestColumn = $worksheet->getHighestColumn();
        $highestColumnIndex = IOFactory::columnIndexFromString($highestColumn);

        $headers = [];
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
            $cell = $worksheet->getCellByColumnAndRow($col, 1);
            $headers[] = $cell->getValue();
        }

        // Map headers
        $mappedHeaders = [];
        foreach ($headers as $index => $header) {
            $header = trim((string) $header);
            if (isset($columnMapping[$header])) {
                $mappedHeaders[$index] = $columnMapping[$header];
            } elseif (isset($columnMapping[strtolower($header)])) {
                $mappedHeaders[$index] = $columnMapping[strtolower($header)];
            }
        }

        // Read data rows
        for ($row = 2; $row <= $highestRow; $row++) {
            $item = [];
            foreach ($mappedHeaders as $index => $field) {
                $cell = $worksheet->getCellByColumnAndRow($index + 1, $row);
                $value = $cell->getValue();
                // Handle null values and DateTime objects
                if ($value instanceof \PhpOffice\PhpSpreadsheet\Shared\Date) {
                    $value = \PhpOffice\PhpSpreadsheet\Shared\Date::ExcelToPHP($value);
                    $value = gmdate('Y-m-d H:i:s', $value);
                }
                $item[$field] = $value === null ? null : $value;
            }
            $data->push($item);
        }

        return $data;
    }

    public function validateData(array $data, array $rules): array
    {
        $errors = [];
        $rowNumber = 0;

        foreach ($data as $row) {
            $rowNumber++;
            $rowErrors = [];

            foreach ($rules as $field => $rule) {
                $value = $row[$field] ?? null;

                if (isset($rule['required']) && $rule['required'] && empty($value)) {
                    $rowErrors[] = "{$field} is required";
                }

                if (isset($rule['max_length']) && strlen($value) > $rule['max_length']) {
                    $rowErrors[] = "{$field} exceeds maximum length of {$rule['max_length']}";
                }

                if (isset($rule['in']) && ! in_array($value, $rule['in'])) {
                    $rowErrors[] = "{$field} must be one of: ".implode(', ', $rule['in']);
                }
            }

            if (! empty($rowErrors)) {
                $errors["Row {$rowNumber}"] = $rowErrors;
            }
        }

        return $errors;
    }

    public function import(string $model, array $data, ?int $tenantId = null): int
    {
        $count = 0;

        foreach ($data as $row) {
            if ($tenantId && isset($row['tenant_id'])) {
                $row['tenant_id'] = $tenantId;
            }

            try {
                $model::create($row);
                $count++;
            } catch (\Exception $e) {
                Log::error('Import failed: '.$e->getMessage(), ['row' => $row]);
            }
        }

        return $count;
    }
}
