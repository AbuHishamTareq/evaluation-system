<?php

namespace App\Features\QuestionSubCategories\Controllers;

use App\Features\QuestionSubCategories\Exports\QuestionSubCategoryExport;
use App\Features\QuestionSubCategories\Exports\QuestionSubCategorySampleExport;
use App\Features\QuestionSubCategories\Imports\QuestionSubCategoryImport;
use App\Features\QuestionSubCategories\Services\QuestionSubCategoryService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\QuestionSubCategory;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Question Sub-Categories
 *
 * APIs for managing question sub-categories.
 */
class QuestionSubCategoryController extends BaseApiController
{
    public function __construct(
        protected QuestionSubCategoryService $questionSubCategoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active', 'question_category_id']);
        $subCategories = $this->questionSubCategoryService->getAll($filters);

        return $this->paginatedResponse($subCategories, 'Question sub-categories retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_category_id' => 'required|integer|exists:question_categories,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:question_sub_categories,code',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        $subCategory = $this->questionSubCategoryService->create($validated);

        return $this->successResponse($subCategory, 'Question sub-category created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $subCategory = $this->questionSubCategoryService->findById($id);

        if (! $subCategory) {
            return $this->errorResponse('Question sub-category not found', 404);
        }

        return $this->successResponse($subCategory, 'Question sub-category retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'question_category_id' => 'sometimes|integer|exists:question_categories,id',
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:question_sub_categories,code,'.$id,
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $subCategory = $this->questionSubCategoryService->update($id, $validated);

        return $this->successResponse($subCategory, 'Question sub-category updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        if ($this->questionSubCategoryService->hasQuestions($id)) {
            return $this->errorResponse('Cannot delete sub-category: it has associated questions. Remove or reassign the questions first.', 409);
        }

        $deleted = $this->questionSubCategoryService->delete($id);

        if (! $deleted) {
            return $this->errorResponse('Question sub-category not found', 404);
        }

        return $this->successResponse(null, 'Question sub-category deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $subCategory = $this->questionSubCategoryService->findById($id);

        if (! $subCategory) {
            return $this->errorResponse('Question sub-category not found', 404);
        }

        $subCategory = $this->questionSubCategoryService->update($id, [
            'is_active' => ! $subCategory->is_active,
        ]);

        $status = $subCategory->is_active ? 'activated' : 'deactivated';

        return $this->successResponse($subCategory, "Question sub-category {$status} successfully");
    }

    public function active(): JsonResponse
    {
        $subCategories = $this->questionSubCategoryService->getActive();

        return $this->successResponse($subCategories, 'Active question sub-categories retrieved successfully');
    }

    public function export(?string $format = null): Response
    {
        $format = strtolower($format ?? 'xlsx');

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'question_sub_categories_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new QuestionSubCategoryExport, "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $questionSubCategories = QuestionSubCategory::with('category')->orderBy('order', 'asc')->get();

        $html = view('exports.question-sub-categories-pdf', [
            'questionSubCategories' => $questionSubCategories,
            'generatedAt' => now()->toIso8601String(),
        ])->render();

        // Prevent accidental output from corrupting the PDF binary
        ob_start();

        // Suppress deprecation warnings for the entire Dompdf lifecycle
        // (the Options constructor and Helpers trigger E_DEPRECATED in PHP 8.5)
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
            $import = new QuestionSubCategoryImport;
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
            return $this->errorResponse('Failed to import question sub-categories: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $filename = 'question-sub-categories-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new QuestionSubCategorySampleExport, $filename);
    }
}
