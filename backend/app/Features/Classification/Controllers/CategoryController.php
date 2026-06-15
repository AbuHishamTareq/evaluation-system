<?php

namespace App\Features\Classification\Controllers;

use App\Features\Classification\Exports\CategoryExport;
use App\Features\Classification\Imports\CategoryImport;
use App\Features\Classification\Services\CategoryService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Category;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Classification - Categories
 *
 * APIs for managing classification categories.
 */
class CategoryController extends BaseApiController
{
    public function __construct(
        protected CategoryService $categoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $categories = $this->categoryService->getAll($filters);

        return $this->paginatedResponse($categories, 'Categories retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:categories,code',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $category = $this->categoryService->create($validated);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = $this->categoryService->findById($id);

        if (! $category) {
            return $this->errorResponse('Category not found', 404);
        }

        return $this->successResponse($category, 'Category retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'sometimes|string|max:50|unique:categories,code,'.$id,
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $category = $this->categoryService->update($id, $validated);

        return $this->successResponse($category, 'Category updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->categoryService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Category not found', 404);
        }

        return $this->successResponse(null, 'Category deleted successfully');
    }

    public function active(): JsonResponse
    {
        $categories = $this->categoryService->getActive();

        return $this->successResponse($categories, 'Active categories retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->categoryService->search($searchTerm);

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

        $filename = 'categories_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new CategoryExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $categories = Category::all();

        $html = view('exports.classification-categories-pdf', [
            'categories' => $categories,
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
            $import = new CategoryImport;
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
            return $this->errorResponse('Failed to import categories: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $path = public_path('templates/categories-sample.xlsx');

        if (! file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'Sample template not found.',
            ], 404);
        }

        $filename = 'categories-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return response()->download($path, $filename);
    }
}
