<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreZoneRequest;
use App\Http\Requests\UpdateZoneRequest;
use App\Models\Region;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ZoneController extends Controller
{
    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Region::query();

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
        $zones = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $zones->items(),
            'meta' => [
                'total' => $zones->total(),
                'current_page' => $zones->currentPage(),
                'last_page' => $zones->lastPage(),
                'per_page' => $zones->perPage(),
            ],
        ]);
    }

    public function store(StoreZoneRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tenant_id'] = $request->user()?->tenant_id ?? 1;
        $zone = Region::create($data);

        return response()->json([
            'data' => $zone,
            'message' => 'Zone created successfully',
        ], 201);
    }

    public function show(Region $zone): JsonResponse
    {
        return response()->json([
            'data' => $zone->load('phcCenters'),
        ]);
    }

    public function update(UpdateZoneRequest $request, Region $zone): JsonResponse
    {
        $zone->update($request->validated());

        return response()->json([
            'data' => $zone,
            'message' => 'Zone updated successfully',
        ]);
    }

    public function destroy(Region $zone): JsonResponse
    {
        $zone->delete();

        return response()->json(['message' => 'Zone deleted successfully']);
    }

    public function toggleStatus(Region $zone): JsonResponse
    {
        $zone->update(['is_active' => ! $zone->is_active]);

        return response()->json([
            'data' => $zone->fresh(),
            'message' => $zone->is_active ? 'Zone activated successfully' : 'Zone deactivated successfully',
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

        foreach ($processedData->toArray() as $zoneData) {
            Region::create($zoneData);
        }

        return response()->json([
            'message' => 'Successfully imported '.count($processedData).' zones',
            'imported_count' => count($processedData),
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = Region::query();

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $zones = $query->get();
        $data = $zones->map(function ($zone) {
            return [
                'Name' => $zone->name,
                'Name (Arabic)' => $zone->name_ar,
                'Code' => $zone->code,
                'Status' => $zone->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel') {
            return $this->exportService->exportToExcel($data, 'zones_export');
        }

        if ($format === 'pdf') {
            return $this->exportService->exportToPdf($data, 'zones_export');
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
            'Content-Disposition' => 'attachment; filename="zones_export.csv"',
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
