<?php

namespace App\Features\Questions\Controllers;

use App\Features\Questions\Exports\QuestionExport;
use App\Features\Questions\Imports\QuestionImport;
use App\Features\Questions\Services\QuestionService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\QuestionCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

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
        $filters = $request->only(['search', 'category_id', 'type', 'per_page']);
        $questions = $this->questionService->getAllQuestions($filters);

        return $this->paginatedResponse($questions, 'Questions retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|string|in:text,textarea,select,radio,checkbox,rating',
            'category_id' => 'required|integer|exists:question_categories,id',
            'description' => 'nullable|string',
            'options' => 'nullable|json',
            'weight' => 'nullable|integer|min:0|max:100',
            'max_score' => 'nullable|integer|min:0|max:1000',
            'is_required' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

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

    public function export(Request $request): BinaryFileResponse
    {
        return Excel::download(new QuestionExport, 'questions.xlsx');
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
        $categories = QuestionCategory::where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'description']);

        return $this->successResponse($categories, 'Categories retrieved successfully');
    }
}
