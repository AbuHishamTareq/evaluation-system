<?php

namespace App\Features\EducationalDegrees\Controllers;

use App\Features\EducationalDegrees\Exports\EducationalDegreeExport;
use App\Features\EducationalDegrees\Imports\EducationalDegreeImport;
use App\Features\EducationalDegrees\Services\EducationalDegreeService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\EducationalDegree;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Educational Degrees
 *
 * APIs for managing educational degree records.
 */
class EducationalDegreeController extends BaseApiController
{
    public function __construct(
        protected EducationalDegreeService $educationalDegreeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $degrees = $this->educationalDegreeService->getAllEducationalDegrees($filters);

        return $this->paginatedResponse($degrees, 'Educational degrees retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:educational_degrees,name',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $degree = $this->educationalDegreeService->createEducationalDegree($validated);

        return $this->successResponse($degree, 'Educational degree created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $degree = $this->educationalDegreeService->getEducationalDegreeById($id);

        if (! $degree) {
            return $this->errorResponse('Educational degree not found', 404);
        }

        return $this->successResponse($degree, 'Educational degree retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:educational_degrees,name,'.$id,
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $degree = $this->educationalDegreeService->updateEducationalDegree($id, $validated);

        return $this->successResponse($degree, 'Educational degree updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->educationalDegreeService->deleteEducationalDegree($id);

        if (! $deleted) {
            return $this->errorResponse('Educational degree not found', 404);
        }

        return $this->successResponse(null, 'Educational degree deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $degree = $this->educationalDegreeService->getEducationalDegreeById($id);

        if (! $degree) {
            return $this->errorResponse('Educational degree not found', 404);
        }

        $degree->update(['is_active' => ! $degree->is_active]);

        return $this->successResponse($degree, 'Educational degree status toggled successfully');
    }

    public function active(): JsonResponse
    {
        $degrees = $this->educationalDegreeService->getActiveEducationalDegrees();

        return $this->successResponse($degrees, 'Active educational degrees retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->educationalDegreeService->searchEducationalDegrees($searchTerm);

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

        $filename = 'educational_degrees_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new EducationalDegreeExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $degrees = EducationalDegree::orderBy('name')->get();

        $html = view('exports.educational_degrees_pdf', [
            'degrees' => $degrees,
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
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        try {
            $import = new EducationalDegreeImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All degrees already exist in the database.';

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
            Log::error('Failed to import educational degrees', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Import failed. Please check your file and try again.', 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/educational-degrees-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'educational-degrees-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
