<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhcCenterRequest;
use App\Http\Requests\UpdatePhcCenterRequest;
use App\Http\Traits\CachesIndex;
use App\Models\PhcCenter;
use App\Models\Region;
use App\Models\TeamBasedCode;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Symfony\Component\HttpFoundation\Response;

class PhcCenterController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'phc_centers:';

    protected static int $cacheTtl = 30;

    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['region_id', 'is_active', 'search', 'per_page', 'page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = PhcCenter::with('region');

            if ($request->has('region_id')) {
                $query->where('region_id', $request->input('region_id'));
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
            $phcCenters = $query->orderByDesc('created_at')->paginate($perPage);

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $phcCenters->items()),
                'meta' => [
                    'total' => $phcCenters->total(),
                    'current_page' => $phcCenters->currentPage(),
                    'last_page' => $phcCenters->lastPage(),
                    'per_page' => $phcCenters->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(StorePhcCenterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()?->tenant_id ?? 1;

        $phcCenter = PhcCenter::create($data);

        $this->clearIndexCache();

        return response()->json([
            'data' => $phcCenter->load('region'),
            'message' => 'PHC Center created successfully',
        ], 201);
    }

    public function show(PhcCenter $phcCenter): JsonResponse
    {
        $cacheKey = static::$cachePrefix.'show:'.$phcCenter->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($phcCenter) {
            $phcCenter->load(['region', 'departments']);

            return ['data' => $phcCenter->toArray()];
        });

        return response()->json($data);
    }

    public function update(UpdatePhcCenterRequest $request, PhcCenter $phcCenter): JsonResponse
    {
        $phcCenter->update($request->validated());

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$phcCenter->id);

        return response()->json([
            'data' => $phcCenter->load('region'),
            'message' => 'PHC Center updated successfully',
        ]);
    }

    public function destroy(PhcCenter $phcCenter): JsonResponse
    {
        $phcCenter->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$phcCenter->id);

        return response()->json(['message' => 'PHC Center deleted successfully']);
    }

    public function toggleStatus(PhcCenter $phcCenter): JsonResponse
    {
        $phcCenter->update(['is_active' => ! $phcCenter->is_active]);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$phcCenter->id);

        return response()->json([
            'data' => $phcCenter->fresh()->load('region'),
            'message' => $phcCenter->is_active ? 'PHC Center activated successfully' : 'PHC Center deactivated successfully',
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
            'Address' => 'address',
            'Phone' => 'phone',
            'Zone' => 'region_id',
            'Status' => 'is_active',
        ];

        $data = $this->processFile($file, $columnMapping);
        $regionMap = Region::pluck('id', 'name')->toArray();

        $processedData = $data->map(function ($row) use ($regionMap) {
            if (! empty($row['region_id'])) {
                $row['region_id'] = $regionMap[$row['region_id']] ?? null;
            }
            if (isset($row['is_active'])) {
                $row['is_active'] = in_array(strtolower($row['is_active']), ['active', 'نشط', '1', 'yes']) ? true : false;
            }
            if (! isset($row['is_active'])) {
                $row['is_active'] = true;
            }

            return $row;
        });

        $tenantId = $request->user()?->tenant_id ?? 1;
        $importedCount = 0;

        foreach ($processedData->toArray() as $phcData) {
            if (! empty($phcData['name'])) {
                $phcData['tenant_id'] = $tenantId;
                PhcCenter::create($phcData);
                $importedCount++;
            }
        }

        $this->clearIndexCache();

        return response()->json([
            'message' => 'Successfully imported '.$importedCount.' PHC Centers',
            'imported_count' => $importedCount,
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = PhcCenter::with('region');

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $phcCenters = $query->get();
        $data = $phcCenters->map(function ($phc) {
            return [
                'Name' => $phc->name,
                'Name (Arabic)' => $phc->name_ar,
                'Code' => $phc->code,
                'Address' => $phc->address,
                'Phone' => $phc->phone,
                'Zone' => $phc->region?->name,
                'Status' => $phc->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel') {
            return $this->exportService->exportToExcel($data, 'phc_centers_export');
        }

        if ($format === 'pdf') {
            return $this->exportService->exportToPdf($data, 'phc_centers_export');
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
            'Content-Disposition' => 'attachment; filename="phc_centers_export.csv"',
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

    /**
     * Get assigned team based codes for a PHC center
     */
    public function getAssignedTeamBasedCodes(PhcCenter $phcCenter): JsonResponse
    {
        $assignedCodes = $phcCenter->teamBasedCodes()->get();

        return response()->json([
            'data' => $assignedCodes->map(function ($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'role' => $code->role,
                    'is_active' => $code->is_active,
                    'pivot' => [
                        'assigned_at' => $code->pivot->created_at,
                    ]
                ];
            }),
        ]);
    }

    /**
     * Get team based codes that are NOT assigned to any PHC center
     */
    public function getAvailableTeamBasedCodes(PhcCenter $phcCenter, Request $request): JsonResponse
    {
        $query = TeamBasedCode::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%");
            });
        }

        // Exclude codes assigned to ANY PHC center (prevents duplicate team codes between PHCs)
        $query->whereDoesntHave('phcCenters');

        $perPage = $request->input('per_page', 15);
        $availableCodes = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $availableCodes->items(),
            'meta' => [
                'total' => $availableCodes->total(),
                'current_page' => $availableCodes->currentPage(),
                'last_page' => $availableCodes->lastPage(),
                'per_page' => $availableCodes->perPage(),
            ],
        ]);
    }

    /**
     * Assign team based codes to PHC center (accepts array in request body)
     */
    public function assignTeamBasedCodes(Request $request, PhcCenter $phcCenter): JsonResponse
    {
        $codeIds = $request->input('team_based_code_ids', []);

        if (empty($codeIds)) {
            return response()->json([
                'message' => 'No team based codes provided',
            ], 422);
        }

        $phcCenter->teamBasedCodes()->syncWithoutDetaching($codeIds);

        return response()->json([
            'message' => 'Team based codes assigned successfully',
        ], 201);
    }

    /**
     * Assign a team based code to PHC center (single, for backward compatibility)
     */
    public function assignTeamBasedCode(PhcCenter $phcCenter, TeamBasedCode $teamBasedCode): JsonResponse
    {
        // Attach the code to the PHC center
        $phcCenter->teamBasedCodes()->attach($teamBasedCode->id);

        return response()->json([
            'message' => 'Team based code assigned successfully',
        ], 201);
    }

    /**
     * Remove a team based code from PHC center
     */
    public function removeTeamBasedCode(PhcCenter $phcCenter, TeamBasedCode $teamBasedCode): JsonResponse
    {
        $phcCenter->teamBasedCodes()->detach($teamBasedCode->id);

        return response()->json([
            'message' => 'Team based code removed successfully',
        ]);
    }

    /**
     * Remove multiple team based codes from PHC center
     */
    public function removeTeamBasedCodes(PhcCenter $phcCenter, Request $request): JsonResponse
    {
        $codeIds = $request->input('team_based_code_ids', []);

        if (empty($codeIds)) {
            return response()->json([
                'message' => 'No team based codes provided for removal',
            ], 422);
        }

        // Detach the codes from the PHC center
        $phcCenter->teamBasedCodes()->detach($codeIds);

        return response()->json([
            'message' => 'Team based codes removed successfully',
            'removed_count' => count($codeIds),
        ]);
    }
}
