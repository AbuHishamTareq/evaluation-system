<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Models\Rank;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;

class RankController extends Controller
{
    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Rank::query();

        if ($request->has('level')) {
            $query->where('level', $request->input('level'));
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
        $ranks = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $ranks->items(),
            'meta' => [
                'total' => $ranks->total(),
                'current_page' => $ranks->currentPage(),
                'last_page' => $ranks->lastPage(),
                'per_page' => $ranks->perPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'level' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        if (! isset($validated['level'])) {
            $validated['level'] = 1;
        }

        $rank = Rank::create($validated);

        return response()->json([
            'data' => $rank,
            'message' => 'Rank created successfully',
        ], 201);
    }

    public function show(Rank $rank): JsonResponse
    {
        return response()->json([
            'data' => $rank,
        ]);
    }

    public function update(Request $request, Rank $rank): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'level' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
        ]);

        $rank->update($validated);

        return response()->json([
            'data' => $rank,
            'message' => 'Rank updated successfully',
        ]);
    }

    public function destroy(Rank $rank): JsonResponse
    {
        $rank->delete();

        return response()->json(['message' => 'Rank deleted successfully']);
    }

    public function toggleStatus(Rank $rank): JsonResponse
    {
        $rank->update(['is_active' => ! $rank->is_active]);

        return response()->json([
            'data' => $rank->fresh(),
            'message' => $rank->is_active ? 'Rank activated successfully' : 'Rank deactivated successfully',
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
            'Level' => 'level',
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
            if (! isset($row['level'])) {
                $row['level'] = 1;
            }

            return $row;
        });

        $importedCount = 0;
        foreach ($processedData->toArray() as $rankData) {
            if (! empty($rankData['name'])) {
                Rank::create($rankData);
                $importedCount++;
            }
        }

        return response()->json([
            'message' => 'Successfully imported '.$importedCount.' ranks',
            'imported_count' => $importedCount,
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = Rank::query();

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $ranks = $query->get();
        $data = $ranks->map(function ($rank) {
            return [
                'Name' => $rank->name,
                'Name (Arabic)' => $rank->name_ar,
                'Code' => $rank->code,
                'Level' => $rank->level,
                'Status' => $rank->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel' || $format === 'pdf') {
            return $this->exportService->exportToExcel($data, 'ranks_export');
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
            'Content-Disposition' => 'attachment; filename="ranks_export.csv"',
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
