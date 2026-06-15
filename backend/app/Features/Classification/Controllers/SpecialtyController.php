<?php

namespace App\Features\Classification\Controllers;

use App\Features\Classification\Exports\SpecialtyExport;
use App\Features\Classification\Imports\SpecialtyImport;
use App\Features\Classification\Services\SpecialtyService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Specialty;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Classification - Specialties
 *
 * APIs for managing classification specialties.
 */
class SpecialtyController extends BaseApiController
{
    public function __construct(
        protected SpecialtyService $specialtyService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active', 'field_id']);
        $specialties = $this->specialtyService->getAll($filters);

        return $this->paginatedResponse($specialties, 'Specialties retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'field_id' => 'required|integer|exists:fields,id',
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:specialties,name,NULL,id,field_id,'.$request->input('field_id'),
            ],
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $specialty = $this->specialtyService->create($validated);

        return $this->successResponse($specialty, 'Specialty created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $specialty = $this->specialtyService->findById($id);

        if (! $specialty) {
            return $this->errorResponse('Specialty not found', 404);
        }

        return $this->successResponse($specialty, 'Specialty retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $specialty = $this->specialtyService->findById($id);
        if (! $specialty) {
            return $this->errorResponse('Specialty not found', 404);
        }

        $validated = $request->validate([
            'field_id' => 'sometimes|integer|exists:fields,id',
            'name' => [
                'sometimes',
                'string',
                'max:255',
                'unique:specialties,name,'.$id.',id,field_id,'.($request->input('field_id') ?? $specialty->field_id),
            ],
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $specialty = $this->specialtyService->update($id, $validated);

        return $this->successResponse($specialty, 'Specialty updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->specialtyService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Specialty not found', 404);
        }

        return $this->successResponse(null, 'Specialty deleted successfully');
    }

    public function active(): JsonResponse
    {
        $specialties = $this->specialtyService->getActive();

        return $this->successResponse($specialties, 'Active specialties retrieved successfully');
    }

    public function byField(int $fieldId): JsonResponse
    {
        $specialties = $this->specialtyService->findByField($fieldId);

        return $this->successResponse($specialties, 'Specialties for field retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->specialtyService->search($searchTerm);

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

        $filename = 'specialties_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new SpecialtyExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $specialties = Specialty::with('field')->get();

        $html = view('exports.classification-specialties-pdf', [
            'specialties' => $specialties,
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
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        try {
            $import = new SpecialtyImport;
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
            return $this->errorResponse('Failed to import specialties: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/specialties-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'specialties-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
