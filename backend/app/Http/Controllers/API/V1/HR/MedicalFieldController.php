<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Traits\CachesIndex;
use App\Models\MedicalField;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;

class MedicalFieldController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'medical_fields:';

    protected static int $cacheTtl = 30;

    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['is_active', 'search', 'per_page', 'page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = MedicalField::query();

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('name_ar', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            }

            $perPage = $request->input('per_page', 15);
            $medicalFields = $query->orderByDesc('created_at')->paginate($perPage);

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $medicalFields->items()),
                'meta' => [
                    'total' => $medicalFields->total(),
                    'current_page' => $medicalFields->currentPage(),
                    'last_page' => $medicalFields->lastPage(),
                    'per_page' => $medicalFields->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $medicalField = MedicalField::create($validated);

        $this->clearIndexCache();

        return response()->json([
            'data' => $medicalField->toArray(),
            'message' => 'Medical Field created successfully',
        ], 201);
    }

    public function show(MedicalField $medicalField): JsonResponse
    {
        $cacheKey = static::$cachePrefix.'show:'.$medicalField->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($medicalField) {
            return ['data' => $medicalField->toArray()];
        });

        return response()->json($data);
    }

    public function update(Request $request, MedicalField $medicalField): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $medicalField->update($validated);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$medicalField->id);

        return response()->json([
            'data' => $medicalField->toArray(),
            'message' => 'Medical Field updated successfully',
        ]);
    }

    public function destroy(MedicalField $medicalField): JsonResponse
    {
        $medicalField->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$medicalField->id);

        return response()->json(['message' => 'Medical Field deleted successfully']);
    }

    public function toggleStatus(MedicalField $medicalField): JsonResponse
    {
        $medicalField->update(['is_active' => ! $medicalField->is_active]);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$medicalField->id);

        return response()->json([
            'data' => $medicalField->fresh()->toArray(),
            'message' => $medicalField->is_active ? 'Medical Field activated successfully' : 'Medical Field deactivated successfully',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240',
        ]);

        $file = $request->file('file');
        $columnMapping = [
            'Name' => 'name',
            'Name (Arabic)' => 'name_ar',
            'Code' => 'code',
            'Status' => 'is_active',
        ];

        $data = $this->processFile($file, $columnMapping);

        $processedData = $data->map(function ($row) {
            if (isset($row['is_active'])) {
                $row['is_active'] = in_array(strtolower($row['is_active']), ['active', 'نشط', '1', 'yes']) ? true : false;
            }
            if (! isset($row['is_active'])) {
                $row['is_active'] = true;
            }

            return $row;
        });

        $importedCount = 0;
        foreach ($processedData->toArray() as $medicalFieldData) {
            if (! empty($medicalFieldData['name'])) {
                MedicalField::create($medicalFieldData);
                $importedCount++;
            }
        }

        $this->clearIndexCache();

        return response()->json([
            'message' => 'Successfully imported '.$importedCount.' medical fields',
            'imported_count' => $importedCount,
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = MedicalField::query();

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $medicalFields = $query->get();
        $data = $medicalFields->map(function ($medicalField) {
            return [
                'Name' => $medicalField->name,
                'Name (Arabic)' => $medicalField->name_ar,
                'Code' => $medicalField->code,
                'Status' => $medicalField->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel' || $format === 'pdf') {
            return $this->exportService->exportToExcel($data, 'medical_fields_export');
        }

        $output = '';
        if (! empty($data)) {
            $headers = array_keys($data[0]);
            $output .= '"'.implode('","', $headers).'"'."\n";
            foreach ($data as $row) {
                $output .= '"'.implode('","', $row).'"'."\n";
            }
        }

        return response($output, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="medical_fields_export.csv"',
        ]);
    }

    private function processFile($file, array $columnMapping)
    {
        $extension = $file->getClientOriginalExtension();

        if (in_array($extension, ['xlsx', 'xls'])) {
            return $this->processExcelFile($file, $columnMapping);
        }

        return $this->processCsvFile($file, $columnMapping);
    }

    private function processCsvFile($file, array $columnMapping)
    {
        $data = [];
        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            $rowData = [];
            foreach ($row as $index => $value) {
                $header = $headers[$index] ?? null;
                if ($header && isset($columnMapping[$header])) {
                    $rowData[$columnMapping[$header]] = $value;
                }
            }
            $data[] = $rowData;
        }
        fclose($handle);

        return collect($data);
    }

    private function processExcelFile($file, array $columnMapping)
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) {
            return collect([]);
        }

        $headers = array_shift($rows);
        $data = [];

        foreach ($rows as $row) {
            $rowData = [];
            foreach ($row as $index => $value) {
                $header = $headers[$index] ?? null;
                if ($header && isset($columnMapping[$header])) {
                    $rowData[$columnMapping[$header]] = $value;
                }
            }
            if (! empty($rowData)) {
                $data[] = $rowData;
            }
        }

        return collect($data);
    }
}
