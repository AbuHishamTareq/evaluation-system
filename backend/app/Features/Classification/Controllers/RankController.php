<?php

namespace App\Features\Classification\Controllers;

use App\Features\Classification\Exports\RankExport;
use App\Features\Classification\Imports\RankImport;
use App\Features\Classification\Services\RankService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Rank;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Classification - Ranks
 *
 * APIs for managing classification ranks.
 */
class RankController extends BaseApiController
{
    public function __construct(
        protected RankService $rankService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $ranks = $this->rankService->getAll($filters);

        return $this->paginatedResponse($ranks, 'Ranks retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:ranks,name',
            'description' => 'nullable|string',
            'level' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['level'] = $validated['level'] ?? 0;

        $rank = $this->rankService->create($validated);

        return $this->successResponse($rank, 'Rank created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $rank = $this->rankService->findById($id);

        if (! $rank) {
            return $this->errorResponse('Rank not found', 404);
        }

        return $this->successResponse($rank, 'Rank retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:ranks,name,'.$id,
            'description' => 'nullable|string',
            'level' => 'sometimes|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $rank = $this->rankService->update($id, $validated);

        return $this->successResponse($rank, 'Rank updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->rankService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Rank not found', 404);
        }

        return $this->successResponse(null, 'Rank deleted successfully');
    }

    public function active(): JsonResponse
    {
        $ranks = $this->rankService->getActive();

        return $this->successResponse($ranks, 'Active ranks retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->rankService->search($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'ranks_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new RankExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $ranks = Rank::all();

        $html = view('exports.classification-ranks-pdf', [
            'ranks' => $ranks,
            'generatedAt' => now()->toIso8601String(),
        ])->render();

        // Prevent accidental output from corrupting the PDF binary
        ob_start();

        // Suppress deprecation warnings for the entire Dompdf lifecycle
        $previousLevel = error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

        try {
            $options = new Options;
            $options->set('isRemoteEnabled', false);
            $options->set('isPhpEnabled', false);

            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();
            $output = $dompdf->output();
        } finally {
            error_reporting($previousLevel);
            ob_end_clean();
        }

        return response($output, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}.pdf\"",
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        try {
            $import = new RankImport;
            Excel::import($import, $request->file('file'));
            $createdCount = $import->getImportedCount();
            $updatedCount = $import->getUpdatedCount();

            return $this->successResponse(null, $createdCount.' records created, '.$updatedCount.' records updated');
        } catch (ValidationException $e) {
            $errors = [];

            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = $message;
                }
            }

            return $this->errorResponse('Validation failed', 422, $errors);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to import ranks: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/ranks-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'ranks-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
