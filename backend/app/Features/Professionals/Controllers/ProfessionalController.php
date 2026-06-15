<?php

namespace App\Features\Professionals\Controllers;

use App\Features\Professionals\Exports\ProfessionalExport;
use App\Features\Professionals\Imports\ProfessionalImport;
use App\Features\Professionals\Services\ProfessionalService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Professional;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Professionals
 *
 * APIs for managing healthcare professionals.
 */
class ProfessionalController extends BaseApiController
{
    public function __construct(
        protected ProfessionalService $professionalService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $professionals = $this->professionalService->getAllProfessionals($filters);

        return $this->paginatedResponse($professionals, 'Professionals retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:professionals,name',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $professional = $this->professionalService->createProfessional($validated);

        return $this->successResponse($professional, 'Professional created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $professional = $this->professionalService->getProfessionalById($id);

        if (! $professional) {
            return $this->errorResponse('Professional not found', 404);
        }

        return $this->successResponse($professional, 'Professional retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:professionals,name,'.$id,
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $professional = $this->professionalService->updateProfessional($id, $validated);

        return $this->successResponse($professional, 'Professional updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->professionalService->deleteProfessional($id);

        if (! $deleted) {
            return $this->errorResponse('Professional not found', 404);
        }

        return $this->successResponse(null, 'Professional deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $professional = $this->professionalService->getProfessionalById($id);

        if (! $professional) {
            return $this->errorResponse('Professional not found', 404);
        }

        $professional->update(['is_active' => ! $professional->is_active]);

        return $this->successResponse($professional, 'Professional status toggled successfully');
    }

    public function active(): JsonResponse
    {
        $professionals = $this->professionalService->getActiveProfessionals();

        return $this->successResponse($professionals, 'Active professionals retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->professionalService->searchProfessionals($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function export(string $format): Response
    {
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'professionals_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new ProfessionalExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $professionals = Professional::orderBy('name')->get();

        $html = view('exports.professionals_pdf', [
            'professionals' => $professionals,
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
            $import = new ProfessionalImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All professionals already exist in the database.';

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
            return $this->errorResponse('Failed to import professionals: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="professionals-sample-'.now()->format('Y-m-d-His').'.csv"',
        ];

        $columns = ['Role Name', 'Description', 'Is Active'];

        $sampleData = [
            ['Senior Nurse', 'Senior nursing professional', '1'],
            ['Lab Technician', 'Laboratory technician professional', '1'],
            ['Pharmacist', 'Licensed pharmacist professional', '0'],
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
