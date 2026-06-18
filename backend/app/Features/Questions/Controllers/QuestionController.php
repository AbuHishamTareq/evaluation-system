<?php

namespace App\Features\Questions\Controllers;

use App\Features\Questions\Exports\QuestionExport;
use App\Features\Questions\Exports\QuestionSampleExport;
use App\Features\Questions\Imports\QuestionImport;
use App\Features\Questions\Services\QuestionService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Question;
use App\Models\QuestionCategory;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * @group Questions
 *
 * APIs for managing evaluation questions, including categories and types.
 */
class QuestionController extends BaseApiController
{
    public function __construct(
        protected QuestionService $questionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'sub_category_id', 'type', 'per_page']);
        $questions = $this->questionService->getAllQuestions($filters);

        $activeCount = Question::where('is_active', true)->count();
        $inactiveCount = Question::where('is_active', false)->count();

        return $this->paginatedResponse($questions, 'Questions retrieved successfully', [
            'active_count' => $activeCount,
            'inactive_count' => $inactiveCount,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|string|in:text,textarea,select,radio,checkbox,rating',
            'category_id' => 'required|integer|exists:question_categories,id',
            'sub_category_id' => 'nullable|integer|exists:question_sub_categories,id',
            'description' => 'nullable|string',
            'options' => 'nullable|json',
            'weight' => 'nullable|integer|min:0|max:100',
            'max_score' => 'nullable|integer|min:0|max:1000',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        // Default is_active to true if not provided
        if (! isset($validated['is_active']) || $validated['is_active'] === null) {
            $validated['is_active'] = true;
        }

        $question = $this->questionService->createQuestion($validated);

        return $this->successResponse($question, 'Question created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $question = $this->questionService->getQuestionById($id);

        if (! $question) {
            return $this->errorResponse('Question not found', 404);
        }

        return $this->successResponse($question, 'Question retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => 'sometimes|string',
            'question_type' => 'sometimes|string|in:text,textarea,select,radio,checkbox,rating',
            'category_id' => 'sometimes|integer|exists:question_categories,id',
            'sub_category_id' => 'nullable|integer|exists:question_sub_categories,id',
            'description' => 'nullable|string',
            'options' => 'nullable|json',
            'weight' => 'nullable|integer|min:0|max:100',
            'max_score' => 'nullable|integer|min:0|max:1000',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $question = $this->questionService->updateQuestion($id, $validated);

        return $this->successResponse($question, 'Question updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->questionService->deleteQuestion($id);

        if (! $deleted) {
            return $this->errorResponse('Question not found', 404);
        }

        return $this->successResponse(null, 'Question deleted successfully');
    }

    public function byCategory(int $categoryId): JsonResponse
    {
        $questions = $this->questionService->getQuestionsByCategory($categoryId);

        return $this->paginatedResponse($questions, 'Questions retrieved successfully');
    }

    public function byType(Request $request): JsonResponse
    {
        $type = $request->get('type');

        if (! in_array($type, ['text', 'textarea', 'select', 'radio', 'checkbox', 'rating'])) {
            return $this->errorResponse('Invalid question type', 400);
        }

        $questions = $this->questionService->getQuestionsByType($type);

        return $this->paginatedResponse($questions, 'Questions retrieved successfully');
    }

    public function export(?string $format = null): BinaryFileResponse|StreamedResponse|Response
    {
        $format = strtolower($format ?? 'xlsx');

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            abort(400, 'Invalid format. Valid formats: '.implode(', ', $validFormats));
        }

        if ($format === 'pdf') {
            return $this->exportPdf();
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';
        $filename = 'questions_'.now()->format('Y-m-d_His').".{$extension}";

        ob_start();
        $previousLevel = error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
        try {
            return Excel::download(new QuestionExport, $filename);
        } finally {
            error_reporting($previousLevel);
            ob_end_clean();
        }
    }

    protected function exportPdf(): Response
    {
        $questions = Question::with(['category', 'subCategory'])
            ->select(['id', 'category_id', 'sub_category_id', 'question_text', 'question_type', 'options'])
            ->orderBy('id')
            ->get();

        $html = view('exports.questions-pdf', [
            'questions' => $questions,
            'generatedAt' => now()->toIso8601String(),
        ])->render();

        ob_start();
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

        $filename = 'questions_'.now()->format('Y-m-d_His').'.pdf';

        return response($output, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function sample(): BinaryFileResponse
    {
        $filename = 'questions-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new QuestionSampleExport, $filename);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        try {
            Excel::import(new QuestionImport, $request->file('file'));

            return $this->successResponse(null, 'Questions imported successfully');
        } catch (ValidationException $e) {
            $errors = [];

            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = $message;
                }
            }

            return $this->errorResponse('Validation failed', 422, $errors);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to import questions: '.$e->getMessage(), 500);
        }
    }

    public function categories(): JsonResponse
    {
        $categories = QuestionCategory::orderBy('order')
            ->orderBy('name')
            ->get();

        return $this->successResponse($categories, 'Categories retrieved successfully');
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:question_categories,code',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
        ]);

        $category = QuestionCategory::create($validated);

        return $this->successResponse($category, 'Category created successfully', 201);
    }

    public function updateCategory(Request $request, int $id): JsonResponse
    {
        $category = QuestionCategory::find($id);

        if (! $category) {
            return $this->errorResponse('Category not found', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:100|unique:question_categories,code,'.$id,
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $category->update($validated);

        return $this->successResponse($category, 'Category updated successfully');
    }

    public function destroyCategory(int $id): JsonResponse
    {
        $category = QuestionCategory::find($id);

        if (! $category) {
            return $this->errorResponse('Category not found', 404);
        }

        $category->delete();

        return $this->successResponse(null, 'Category deleted successfully');
    }
}
