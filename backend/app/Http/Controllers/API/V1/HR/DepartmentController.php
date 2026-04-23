<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Traits\CachesIndex;
use App\Models\Department;
use App\Models\PhcCenter;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\Response;

class DepartmentController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'departments:';

    protected static int $cacheTtl = 30;

    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['phc_center_id', 'is_active', 'search', 'per_page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = Department::with('phcCenter');

            if ($request->has('phc_center_id')) {
                $query->where('phc_center_id', $request->input('phc_center_id'));
            }

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
            $departments = $query->orderByDesc('created_at')->paginate($perPage);

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $departments->items()),
                'meta' => [
                    'total' => $departments->total(),
                    'current_page' => $departments->currentPage(),
                    'last_page' => $departments->lastPage(),
                    'per_page' => $departments->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        $this->clearIndexCache();

        return response()->json([
            'data' => $department->load('phcCenter'),
            'message' => 'Department created successfully',
        ], 201);
    }

    public function show(Department $department): JsonResponse
    {
        $cacheKey = static::$cachePrefix.'show:'.$department->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($department) {
            $department->load('phcCenter');

            return ['data' => $department->toArray()];
        });

        return response()->json($data);
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$department->id);

        return response()->json([
            'data' => $department->load('phcCenter'),
            'message' => 'Department updated successfully',
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        $department->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$department->id);

        return response()->json(['message' => 'Department deleted successfully']);
    }

    public function toggleStatus(Department $department): JsonResponse
    {
        $department->update(['is_active' => ! $department->is_active]);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$department->id);

        return response()->json([
            'data' => $department->fresh()->load('phcCenter'),
            'message' => $department->is_active ? 'Department activated successfully' : 'Department deactivated successfully',
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
            'PHC Center' => 'phc_center_id',
            'Status' => 'is_active',
        ];

        $data = $this->processFile($file, $columnMapping);
        $phcCenterMap = PhcCenter::pluck('id', 'name')->toArray();

        $processedData = $data->map(function ($row) use ($phcCenterMap) {
            if (! empty($row['phc_center_id'])) {
                $row['phc_center_id'] = $phcCenterMap[$row['phc_center_id']] ?? null;
            }
            if (isset($row['is_active'])) {
                $row['is_active'] = in_array(strtolower($row['is_active']), ['active', 'نشط', '1', 'yes']) ? true : false;
            }

            return $row;
        });

        $importedCount = 0;
        foreach ($processedData->toArray() as $departmentData) {
            if (! empty($departmentData['name'])) {
                Department::create($departmentData);
                $importedCount++;
            }
        }

        $this->clearIndexCache();

        return response()->json([
            'message' => 'Successfully imported '.$importedCount.' departments',
            'imported_count' => $importedCount,
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = Department::with('phcCenter');

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $departments = $query->get();
        $data = $departments->map(function ($dept) {
            return [
                'Name' => $dept->name,
                'Name (Arabic)' => $dept->name_ar,
                'Code' => $dept->code,
                'PHC Center' => $dept->phcCenter?->name,
                'Status' => $dept->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel') {
            return $this->exportService->exportToExcel($data, 'departments_export');
        }

        if ($format === 'pdf') {
            return $this->exportService->exportToPdf($data, 'departments_export');
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
            'Content-Disposition' => 'attachment; filename="departments_export.csv"',
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
