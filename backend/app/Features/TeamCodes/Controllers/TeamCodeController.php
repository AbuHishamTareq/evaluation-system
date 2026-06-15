<?php

namespace App\Features\TeamCodes\Controllers;

use App\Features\TeamCodes\Exports\TeamCodeExport;
use App\Features\TeamCodes\Imports\TeamCodeImport;
use App\Features\TeamCodes\Services\TeamCodeService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\TeamCode;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Team Codes
 *
 * APIs for managing team code assignments and lookups.
 */
class TeamCodeController extends BaseApiController
{
    public function __construct(
        protected TeamCodeService $teamCodeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'center_id']);
        $teamCodes = $this->teamCodeService->getAllTeamCodes($filters);

        return $this->paginatedResponse($teamCodes, 'Team codes retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:team_codes,code',
            'description' => 'nullable|string',
            'role' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'center_id' => 'nullable|integer|exists:phc_centers,id',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $teamCode = $this->teamCodeService->createTeamCode($validated);

        return $this->successResponse($teamCode, 'Team code created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $teamCode = $this->teamCodeService->getTeamCodeById($id);

        if (! $teamCode) {
            return $this->errorResponse('Team code not found', 404);
        }

        return $this->successResponse($teamCode, 'Team code retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:team_codes,code,'.$id,
            'description' => 'nullable|string',
            'role' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'center_id' => 'nullable|integer|exists:phc_centers,id',
        ]);

        $teamCode = $this->teamCodeService->updateTeamCode($id, $validated);

        return $this->successResponse($teamCode, 'Team code updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->teamCodeService->deleteTeamCode($id);

        if (! $deleted) {
            return $this->errorResponse('Team code not found', 404);
        }

        return $this->successResponse(null, 'Team code deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $teamCode = $this->teamCodeService->getTeamCodeById($id);

        if (! $teamCode) {
            return $this->errorResponse('Team code not found', 404);
        }

        $teamCode->update(['is_active' => ! $teamCode->is_active]);

        return $this->successResponse($teamCode, 'Team code status toggled successfully');
    }

    public function active(): JsonResponse
    {
        $teamCodes = $this->teamCodeService->getActiveTeamCodes();

        return $this->successResponse($teamCodes, 'Active team codes retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->teamCodeService->searchTeamCodes($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function statistics(int $id): JsonResponse
    {
        $stats = $this->teamCodeService->getTeamCodeStatistics($id);

        if (empty($stats)) {
            return $this->errorResponse('Team code not found', 404);
        }

        return $this->successResponse($stats, 'Team code statistics retrieved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'team_codes_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new TeamCodeExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $teamCodes = TeamCode::with('center')->get();

        $html = view('exports.team_codes_pdf', [
            'teamCodes' => $teamCodes,
            'generatedAt' => now()->toIso8601String(),
        ])->render();

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return response($dompdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}.pdf\"",
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        try {
            $import = new TeamCodeImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All codes already exist in the database.';

            return $this->successResponse(null, $message);
        } catch (ValidationException $e) {
            $errors = [];

            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = $message;
                }
            }

            return $this->errorResponse('Validation failed', 422, $errors);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to import team codes: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/team-codes-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'team-codes-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
