<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePhcCenterRequest;
use App\Http\Requests\UpdatePhcCenterRequest;
use App\Models\PhcCenter;
use App\Models\Region;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PhcCenterController extends Controller
{
    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
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

        return response()->json([
            'data' => $phcCenters->items(),
            'meta' => [
                'total' => $phcCenters->total(),
                'current_page' => $phcCenters->currentPage(),
                'last_page' => $phcCenters->lastPage(),
                'per_page' => $phcCenters->perPage(),
            ],
        ]);
    }

    public function store(StorePhcCenterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()?->tenant_id ?? 1;

        $phcCenter = PhcCenter::create($data);

        return response()->json([
            'data' => $phcCenter->load('region'),
            'message' => 'PHC Center created successfully',
        ], 201);
    }

    public function show(PhcCenter $phcCenter): JsonResponse
    {
        return response()->json([
            'data' => $phcCenter->load(['region', 'departments']),
        ]);
    }

    public function update(UpdatePhcCenterRequest $request, PhcCenter $phcCenter): JsonResponse
    {
        $phcCenter->update($request->validated());

        return response()->json([
            'data' => $phcCenter->load('region'),
            'message' => 'PHC Center updated successfully',
        ]);
    }

    public function destroy(PhcCenter $phcCenter): JsonResponse
    {
        $phcCenter->delete();

        return response()->json(['message' => 'PHC Center deleted successfully']);
    }

    public function toggleStatus(PhcCenter $phcCenter): JsonResponse
    {
        $phcCenter->update(['is_active' => ! $phcCenter->is_active]);

        return response()->json([
            'data' => $phcCenter->fresh()->load('region'),
            'message' => $phcCenter->is_active ? 'PHC Center activated successfully' : 'PHC Center deactivated successfully',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240',
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

        foreach ($processedData->toArray() as $phcData) {
            $phcData['tenant_id'] = $tenantId;
            PhcCenter::create($phcData);
        }

        return response()->json([
            'message' => 'Successfully imported '.count($processedData).' PHC Centers',
            'imported_count' => count($processedData),
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
}
