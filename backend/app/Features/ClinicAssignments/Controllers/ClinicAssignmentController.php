<?php

namespace App\Features\ClinicAssignments\Controllers;

use App\Features\ClinicAssignments\Exports\ClinicAssignmentExport;
use App\Features\ClinicAssignments\Imports\ClinicAssignmentImport;
use App\Features\ClinicAssignments\Services\ClinicAssignmentService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\ClinicAssignment;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Clinic Assignments
 *
 * APIs for managing clinic assignment records.
 */
class ClinicAssignmentController extends BaseApiController
{
    public function __construct(
        protected ClinicAssignmentService $clinicAssignmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $clinicAssignments = $this->clinicAssignmentService->getAllClinicAssignments($filters);

        return $this->paginatedResponse($clinicAssignments, 'Clinic assignments retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:clinic_assignments,name',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $clinicAssignment = $this->clinicAssignmentService->createClinicAssignment($validated);

        return $this->successResponse($clinicAssignment, 'Clinic assignment created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $clinicAssignment = $this->clinicAssignmentService->getClinicAssignmentById($id);

        if (! $clinicAssignment) {
            return $this->errorResponse('Clinic assignment not found', 404);
        }

        return $this->successResponse($clinicAssignment, 'Clinic assignment retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:clinic_assignments,name,'.$id,
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $clinicAssignment = $this->clinicAssignmentService->updateClinicAssignment($id, $validated);

        return $this->successResponse($clinicAssignment, 'Clinic assignment updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->clinicAssignmentService->deleteClinicAssignment($id);

        if (! $deleted) {
            return $this->errorResponse('Clinic assignment not found', 404);
        }

        return $this->successResponse(null, 'Clinic assignment deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $clinicAssignment = $this->clinicAssignmentService->getClinicAssignmentById($id);

        if (! $clinicAssignment) {
            return $this->errorResponse('Clinic assignment not found', 404);
        }

        $clinicAssignment->update(['is_active' => ! $clinicAssignment->is_active]);

        return $this->successResponse($clinicAssignment, 'Clinic assignment status toggled successfully');
    }

    public function active(): JsonResponse
    {
        $clinicAssignments = $this->clinicAssignmentService->getActiveClinicAssignments();

        return $this->successResponse($clinicAssignments, 'Active clinic assignments retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->clinicAssignmentService->searchClinicAssignments($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function export(string $format): Response
    {
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'clinic_assignments_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new ClinicAssignmentExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $clinicAssignments = ClinicAssignment::orderBy('name')->get();

        $html = view('exports.clinic_assignments_pdf', [
            'clinicAssignments' => $clinicAssignments,
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
            $import = new ClinicAssignmentImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All clinic assignments already exist in the database.';

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
            return $this->errorResponse('Failed to import clinic assignments: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="clinic-assignments-sample-'.now()->format('Y-m-d-His').'.csv"',
        ];

        $columns = ['Clinic Assignment', 'Description', 'Is Active'];

        $sampleData = [
            ['General Clinic', 'General medical clinic', '1'],
            ['Dental Clinic', 'Dental care clinic', '1'],
            ['Maternity Clinic', 'Maternity and childbirth services', '0'],
        ];

        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');

            fputcsv($file, $columns);

            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
