<?php

namespace App\Features\Classification\Controllers;

use App\Features\Classification\Exports\FieldExport;
use App\Features\Classification\Imports\FieldImport;
use App\Features\Classification\Services\FieldService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Field;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Classification - Fields
 *
 * APIs for managing classification fields.
 */
class FieldController extends BaseApiController
{
    public function __construct(
        protected FieldService $fieldService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $fields = $this->fieldService->getAll($filters);

        return $this->paginatedResponse($fields, 'Fields retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:fields,name',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $field = $this->fieldService->create($validated);

        return $this->successResponse($field, 'Field created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $field = $this->fieldService->findById($id);

        if (! $field) {
            return $this->errorResponse('Field not found', 404);
        }

        return $this->successResponse($field, 'Field retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:fields,name,'.$id,
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $field = $this->fieldService->update($id, $validated);

        return $this->successResponse($field, 'Field updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->fieldService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Field not found', 404);
        }

        return $this->successResponse(null, 'Field deleted successfully');
    }

    public function active(): JsonResponse
    {
        $fields = $this->fieldService->getActive();

        return $this->successResponse($fields, 'Active fields retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->fieldService->search($searchTerm);

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

        $filename = 'fields_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new FieldExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $fields = Field::all();

        $html = view('exports.classification-fields-pdf', [
            'fields' => $fields,
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
            $import = new FieldImport;
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
            return $this->errorResponse('Failed to import fields: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/fields-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'fields-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
