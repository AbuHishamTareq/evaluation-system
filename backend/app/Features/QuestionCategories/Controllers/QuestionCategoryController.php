<?php

namespace App\Features\QuestionCategories\Controllers;

use App\Features\QuestionCategories\Exports\QuestionCategoryExport;
use App\Features\QuestionCategories\Exports\QuestionCategorySampleExport;
use App\Features\QuestionCategories\Imports\QuestionCategoryImport;
use App\Features\QuestionCategories\Services\QuestionCategoryService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\QuestionCategory;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Question Categories
 *
 * APIs for managing question categories (separate from classification categories).
 */
class QuestionCategoryController extends BaseApiController
{
    public function __construct(
        protected QuestionCategoryService $questionCategoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active']);
        $categories = $this->questionCategoryService->getAll($filters);

        return $this->paginatedResponse($categories, 'Question categories retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:question_categories,code',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        $category = $this->questionCategoryService->create($validated);

        return $this->successResponse($category, 'Question category created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $category = $this->questionCategoryService->findById($id);

        if (! $category) {
            return $this->errorResponse('Question category not found', 404);
        }

        return $this->successResponse($category, 'Question category retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:question_categories,code,'.$id,
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $category = $this->questionCategoryService->update($id, $validated);

        return $this->successResponse($category, 'Question category updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        if ($this->questionCategoryService->hasQuestions($id)) {
            return $this->errorResponse('Cannot delete category: it has associated questions. Remove or reassign the questions first.', 409);
        }

        $deleted = $this->questionCategoryService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Question category not found', 404);
        }

        return $this->successResponse(null, 'Question category deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $category = $this->questionCategoryService->findById($id);

        if (! $category) {
            return $this->errorResponse('Question category not found', 404);
        }

        $category = $this->questionCategoryService->update($id, [
            'is_active' => ! $category->is_active,
        ]);

        $status = $category->is_active ? 'activated' : 'deactivated';

        return $this->successResponse($category, "Question category {$status} successfully");
    }

    public function active(): JsonResponse
    {
        $categories = $this->questionCategoryService->getActive();

        return $this->successResponse($categories, 'Active question categories retrieved successfully');
    }

    public function export(?string $format = null): Response
    {
        $format = strtolower($format ?? 'xlsx');

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'question_categories_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new QuestionCategoryExport, "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $questionCategories = QuestionCategory::orderBy('order', 'asc')->get();

        $html = view('exports.question-categories-pdf', [
            'questionCategories' => $questionCategories,
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
            $import = new QuestionCategoryImport;
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
            return $this->errorResponse('Failed to import question categories: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $filename = 'question-categories-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new QuestionCategorySampleExport, $filename);
    }
}
