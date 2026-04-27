<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Models\TeamBasedCode;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;

class TeamBasedCodeController extends Controller
{
    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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

        $perPage = $request->input('per_page', 15);
        $teamBasedCodes = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $teamBasedCodes->items(),
            'meta' => [
                'total' => $teamBasedCodes->total(),
                'current_page' => $teamBasedCodes->currentPage(),
                'last_page' => $teamBasedCodes->lastPage(),
                'per_page' => $teamBasedCodes->perPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.create', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:team_based_codes,code',
            'role' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $teamBasedCode = TeamBasedCode::create($validated);

        return response()->json([
            'data' => $teamBasedCode->toArray(),
            'message' => 'Team Based Code created successfully',
        ], 201);
    }

    public function show(TeamBasedCode $teamBasedCode): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => $teamBasedCode->toArray(),
        ]);
    }

    public function update(Request $request, TeamBasedCode $teamBasedCode): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'code' => 'sometimes|string|max:255|unique:team_based_codes,code,'.$teamBasedCode->id,
            'role' => 'sometimes|string|max:255',
            'is_active' => 'boolean',
        ]);

        $teamBasedCode->update($validated);

        return response()->json([
            'data' => $teamBasedCode->fresh()->toArray(),
            'message' => 'Team Based Code updated successfully',
        ]);
    }

    public function destroy(TeamBasedCode $teamBasedCode): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.delete', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $teamBasedCode->delete();

        return response()->json([
            'message' => 'Team Based Code deleted successfully',
        ]);
    }

    public function toggleStatus(TeamBasedCode $teamBasedCode): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $teamBasedCode->update(['is_active' => ! $teamBasedCode->is_active]);

        return response()->json([
            'data' => $teamBasedCode->fresh()->toArray(),
            'message' => 'Status toggled successfully',
        ]);
    }

    public function export(Request $request)
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = TeamBasedCode::query();

        $ids = $request->input('ids');
        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $teamBasedCodes = $query->get();
        $data = $teamBasedCodes->map(function ($item) {
            return [
                'Code' => $item->code,
                'Role' => $item->role,
                'Status' => $item->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        $format = $request->input('format', 'csv');

        if ($format === 'excel') {
            return $this->exportService->exportToExcel($data, 'team_based_codes_export');
        }

        if ($format === 'pdf') {
            return $this->exportService->exportToPdf($data, 'team_based_codes_export');
        }

        return $this->exportService->exportToCsv($data, 'team_based_codes_export');
    }

    public function import(Request $request)
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('team_based_codes.create', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls',
        ]);

        $file = $request->file('file');
        $extension = $file->getClientOriginalExtension();

        if (in_array($extension, ['xlsx', 'xls'])) {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
        } else {
            $handle = fopen($file->getRealPath(), 'r');
            $rows = [];
            while (($row = fgetcsv($handle)) !== false) {
                $rows[] = $row;
            }
            fclose($handle);
        }

        if (empty($rows)) {
            return response()->json(['message' => 'No data found in file'], 422);
        }

        $headerRow = array_shift($rows);
        $mapping = [];
        foreach ($headerRow as $index => $header) {
            $header = strtolower(trim($header));
            if ($header === 'code') {
                $mapping[$index] = 'code';
            } elseif (in_array($header, ['role', 'role'])) {
                $mapping[$index] = 'role';
            }
        }

        $created = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            if (empty(array_filter($row))) {
                continue;
            }

            $data = [];
            foreach ($row as $index => $value) {
                if (isset($mapping[$index])) {
                    $data[$mapping[$index]] = $value;
                }
            }

            if (empty($data['code'])) {
                $skipped++;

                continue;
            }

            $exists = TeamBasedCode::where('code', $data['code'])->exists();
            if ($exists) {
                $skipped++;

                continue;
            }

            TeamBasedCode::create([
                'code' => $data['code'],
                'role' => $data['role'] ?? 'Member',
                'is_active' => true,
            ]);
            $created++;
        }

        return response()->json([
            'message' => "Import completed: {$created} created, {$skipped} skipped",
        ]);
    }

    private function exportToExcel(array $data, string $filename)
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();

        if (! empty($data)) {
            $sheet->fromArray([array_keys($data[0])], null, 'A1');
            $sheet->fromArray($data, null, 'A2');
        }

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $tempFile = tempnam(sys_get_temp_dir(), 'export_');
        $writer->save($tempFile);

        return response()->download($tempFile, "{$filename}.xlsx", [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}
