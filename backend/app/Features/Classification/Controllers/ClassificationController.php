<?php

namespace App\Features\Classification\Controllers;

use App\Features\Classification\Exports\ClassificationMappingExport;
use App\Features\Classification\Imports\ClassificationMappingImport;
use App\Features\Classification\Services\ClassificationService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\ClassificationMapping;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Classification - Mappings
 *
 * APIs for managing classification mappings between fields, specialties, ranks, and categories.
 */
class ClassificationController extends BaseApiController
{
    public function __construct(
        protected ClassificationService $classificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'field_id', 'specialty_id', 'rank_id', 'category_id']);
        $mappings = $this->classificationService->getAll($filters);

        return $this->paginatedResponse($mappings, 'Classification mappings retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'field_id' => 'required|integer|exists:fields,id',
            'specialty_id' => 'required|integer|exists:specialties,id',
            'rank_id' => 'required|integer|exists:ranks,id',
            'category_id' => 'required|integer|exists:categories,id',
        ]);

        if ($this->classificationService->mappingExists(
            $validated['field_id'],
            $validated['specialty_id'],
            $validated['rank_id']
        )) {
            return $this->errorResponse(
                'A classification mapping already exists for this field, specialty, and rank combination',
                422
            );
        }

        $mapping = $this->classificationService->create($validated);

        return $this->successResponse($mapping, 'Classification mapping created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $mapping = $this->classificationService->findById($id);

        if (! $mapping) {
            return $this->errorResponse('Classification mapping not found', 404);
        }

        return $this->successResponse($mapping, 'Classification mapping retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $mapping = $this->classificationService->findById($id);
        if (! $mapping) {
            return $this->errorResponse('Classification mapping not found', 404);
        }

        $validated = $request->validate([
            'field_id' => 'sometimes|integer|exists:fields,id',
            'specialty_id' => 'sometimes|integer|exists:specialties,id',
            'rank_id' => 'sometimes|integer|exists:ranks,id',
            'category_id' => 'sometimes|integer|exists:categories,id',
        ]);

        $fieldId = $validated['field_id'] ?? $mapping->field_id;
        $specialtyId = $validated['specialty_id'] ?? $mapping->specialty_id;
        $rankId = $validated['rank_id'] ?? $mapping->rank_id;

        if ($this->classificationService->mappingExists($fieldId, $specialtyId, $rankId, $id)) {
            return $this->errorResponse(
                'A classification mapping already exists for this field, specialty, and rank combination',
                422
            );
        }

        $mapping = $this->classificationService->update($id, $validated);

        return $this->successResponse($mapping, 'Classification mapping updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->classificationService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Classification mapping not found', 404);
        }

        return $this->successResponse(null, 'Classification mapping deleted successfully');
    }

    public function resolve(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'field_id' => 'required|integer|exists:fields,id',
            'specialty_id' => 'required|integer|exists:specialties,id',
            'rank_id' => 'required|integer|exists:ranks,id',
        ]);

        $mapping = $this->classificationService->resolve(
            $validated['field_id'],
            $validated['specialty_id'],
            $validated['rank_id']
        );

        if (! $mapping) {
            return $this->errorResponse(
                'No classification mapping found for the given field, specialty, and rank combination',
                404
            );
        }

        return response()->json([
            'category' => $mapping->category,
            'mapping' => $mapping,
            'message' => 'Classification resolved successfully',
        ]);
    }

    public function category(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'field_id' => 'required|integer|exists:fields,id',
            'specialty_id' => 'required|integer|exists:specialties,id',
            'rank_id' => 'required|integer|exists:ranks,id',
        ]);

        $category = $this->classificationService->getCategory(
            $validated['field_id'],
            $validated['specialty_id'],
            $validated['rank_id']
        );

        return $this->successResponse($category, 'Category resolved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'classifications_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new ClassificationMappingExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $mappings = ClassificationMapping::with(['field', 'specialty', 'rank', 'category'])->get();

        $html = view('exports.classification-mappings-pdf', [
            'mappings' => $mappings,
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
            $import = new ClassificationMappingImport;
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
            return $this->errorResponse('Failed to import classifications: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/classifications-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'classifications-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
