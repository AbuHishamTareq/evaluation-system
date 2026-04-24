<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Traits\CachesIndex;
use App\Models\MedicalField;
use App\Models\Rank;
use App\Models\ShcCategory;
use App\Models\Specialty;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ShcCategoryController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'shc_categories:';

    protected static int $cacheTtl = 30;

    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['medical_field_id', 'specialty_id', 'rank_id', 'is_active', 'search', 'per_page', 'page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = ShcCategory::with(['medicalField', 'specialty', 'rank']);

            if ($request->has('medical_field_id')) {
                $query->where('medical_field_id', $request->input('medical_field_id'));
            }

            if ($request->has('specialty_id')) {
                $query->where('specialty_id', $request->input('specialty_id'));
            }

            if ($request->has('rank_id')) {
                $query->where('rank_id', $request->input('rank_id'));
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('description_ar', 'like', "%{$search}%");
                });
            }

            $perPage = $request->input('per_page', 15);
            $shcCategories = $query->orderByDesc('created_at')->paginate($perPage);

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $shcCategories->items()),
                'meta' => [
                    'total' => $shcCategories->total(),
                    'current_page' => $shcCategories->currentPage(),
                    'last_page' => $shcCategories->lastPage(),
                    'per_page' => $shcCategories->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medical_field_id' => 'nullable|exists:medical_fields,id',
            'specialty_id' => 'nullable|exists:specialties,id',
            'rank_id' => 'nullable|exists:ranks,id',
            'code' => 'required|string|max:50|unique:shc_categories,code',
            'description' => 'nullable|string|max:500',
            'description_ar' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $shcCategory = ShcCategory::create($validated);

        $this->clearIndexCache();

        return response()->json([
            'data' => $shcCategory->toArray(),
            'message' => 'SHC Category created successfully',
        ], 201);
    }

    public function show(ShcCategory $shcCategory): JsonResponse
    {
        $cacheKey = static::$cachePrefix.'show:'.$shcCategory->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($shcCategory) {
            $shcCategory->load(['medicalField', 'specialty', 'rank']);

            return ['data' => $shcCategory->toArray()];
        });

        return response()->json($data);
    }

    public function update(Request $request, ShcCategory $shcCategory): JsonResponse
    {
        $validated = $request->validate([
            'medical_field_id' => 'nullable|exists:medical_fields,id',
            'specialty_id' => 'nullable|exists:specialties,id',
            'rank_id' => 'nullable|exists:ranks,id',
            'code' => 'sometimes|string|max:50|unique:shc_categories,code,'.$shcCategory->id,
            'description' => 'nullable|string|max:500',
            'description_ar' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        $shcCategory->update($validated);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$shcCategory->id);

        return response()->json([
            'data' => $shcCategory->toArray(),
            'message' => 'SHC Category updated successfully',
        ]);
    }

    public function destroy(ShcCategory $shcCategory): JsonResponse
    {
        $shcCategory->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$shcCategory->id);

        return response()->json(['message' => 'SHC Category deleted successfully']);
    }

    public function toggleStatus(ShcCategory $shcCategory): JsonResponse
    {
        $shcCategory->update(['is_active' => ! $shcCategory->is_active]);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$shcCategory->id);

        return response()->json([
            'data' => $shcCategory->fresh()->toArray(),
            'message' => $shcCategory->is_active ? 'SHC Category activated successfully' : 'SHC Category deactivated successfully',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240',
        ]);

        $file = $request->file('file');
        $columnMapping = [
            'Code' => 'code',
            'Description' => 'description',
            'Description (Arabic)' => 'description_ar',
            'Medical Field' => 'medical_field_id',
            'Specialty' => 'specialty_id',
            'Rank' => 'rank_id',
            'Status' => 'is_active',
        ];

        $data = $this->processFile($file, $columnMapping);
        $medicalFieldMap = MedicalField::pluck('id', 'name')->toArray();
        $specialtyMap = Specialty::pluck('id', 'name')->toArray();
        $rankMap = Rank::pluck('id', 'name')->toArray();

        $processedData = $data->map(function ($row) use ($medicalFieldMap, $specialtyMap, $rankMap) {
            if (! empty($row['medical_field_id'])) {
                $row['medical_field_id'] = $medicalFieldMap[$row['medical_field_id']] ?? null;
            }
            if (! empty($row['specialty_id'])) {
                $row['specialty_id'] = $specialtyMap[$row['specialty_id']] ?? null;
            }
            if (! empty($row['rank_id'])) {
                $row['rank_id'] = $rankMap[$row['rank_id']] ?? null;
            }
            if (isset($row['is_active'])) {
                $row['is_active'] = in_array(strtolower($row['is_active']), ['active', 'نشط', '1', 'yes']) ? true : false;
            }
            if (! isset($row['is_active'])) {
                $row['is_active'] = true;
            }

            return $row;
        });

        $importedCount = 0;
        foreach ($processedData->toArray() as $shcCategoryData) {
            if (! empty($shcCategoryData['code'])) {
                ShcCategory::create($shcCategoryData);
                $importedCount++;
            }
        }

        $this->clearIndexCache();

        return response()->json([
            'message' => 'Successfully imported '.$importedCount.' SHC categories',
            'imported_count' => $importedCount,
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = ShcCategory::with(['medicalField', 'specialty', 'rank']);

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $shcCategories = $query->get();
        $data = $shcCategories->map(function ($shcCategory) {
            return [
                'Code' => $shcCategory->code,
                'Description' => $shcCategory->description,
                'Description (Arabic)' => $shcCategory->description_ar,
                'Medical Field' => $shcCategory->medicalField?->name,
                'Medical Field ID' => $shcCategory->medical_field_id,
                'Specialty' => $shcCategory->specialty?->name,
                'Specialty ID' => $shcCategory->specialty_id,
                'Rank' => $shcCategory->rank?->name,
                'Rank ID' => $shcCategory->rank_id,
                'Status' => $shcCategory->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel' || $format === 'pdf') {
            return $this->exportService->exportToExcel($data, 'shc_categories_export');
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
            'Content-Disposition' => 'attachment; filename="shc_categories_export.csv"',
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
