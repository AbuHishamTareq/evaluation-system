<?php

namespace App\Features\Evaluations\Controllers;

use App\Features\Evaluations\Services\EvaluationService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Evaluations
 *
 * APIs for managing performance evaluations, including submission and approval workflows.
 */
class EvaluationController extends BaseApiController
{
    public function __construct(
        protected EvaluationService $evaluationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'staff_id', 'evaluator_id', 'center_id', 'template_id', 'search', 'per_page']);
        $evaluations = $this->evaluationService->getAllEvaluations($filters);

        return $this->paginatedResponse($evaluations, 'Evaluations retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|integer|exists:evaluation_templates,id',
            'phc_center_id' => 'required|integer|exists:phc_centers,id',
            'staff_id' => 'nullable|integer|exists:staff,id',
            'evaluator_id' => 'required|integer|exists:users,id',
            'status' => 'nullable|string|in:draft,in_progress,completed,archived',
            'notes' => 'nullable|string',
        ]);

        $evaluation = $this->evaluationService->createEvaluation($validated);

        return $this->successResponse($evaluation, 'Evaluation created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $evaluation = $this->evaluationService->getEvaluationById($id);

        if (! $evaluation) {
            return $this->errorResponse('Evaluation not found', 404);
        }

        return $this->successResponse($evaluation, 'Evaluation retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'sometimes|integer|exists:evaluation_templates,id',
            'phc_center_id' => 'sometimes|integer|exists:phc_centers,id',
            'staff_id' => 'nullable|integer|exists:staff,id',
            'evaluator_id' => 'sometimes|integer|exists:users,id',
            'status' => 'sometimes|string|in:draft,in_progress,completed,archived',
            'notes' => 'nullable|string',
            'answers' => 'nullable|array',
            'answers.*.question_id' => 'required_with:answers|integer|exists:questions,id',
            'answers.*.answer_text' => 'nullable|string',
            'answers.*.answer_yes_no' => 'nullable|string|in:yes,no',
            'answers.*.answer_rating' => 'nullable|integer|min:1|max:5',
            'answers.*.answer_multiple_choice' => 'nullable|string',
            'answers.*.comment' => 'nullable|string',
        ]);

        $evaluation = $this->evaluationService->updateEvaluation($id, $validated);

        return $this->successResponse($evaluation, 'Evaluation updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->evaluationService->deleteEvaluation($id);

        if (! $deleted) {
            return $this->errorResponse('Evaluation not found', 404);
        }

        return $this->successResponse(null, 'Evaluation deleted successfully');
    }

    public function submit(int $id): JsonResponse
    {
        try {
            $evaluation = $this->evaluationService->submitEvaluation($id);

            return $this->successResponse($evaluation, 'Evaluation submitted successfully');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function approve(int $id): JsonResponse
    {
        try {
            $evaluation = $this->evaluationService->approveEvaluation($id);

            return $this->successResponse($evaluation, 'Evaluation approved successfully');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function byStaff(int $staffId): JsonResponse
    {
        $evaluations = $this->evaluationService->getEvaluationsByStaff($staffId);

        return $this->paginatedResponse($evaluations, 'Evaluations retrieved successfully');
    }

    public function byPeriod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $evaluations = $this->evaluationService->getEvaluationsByPeriod(
            $validated['start_date'],
            $validated['end_date']
        );

        return $this->paginatedResponse($evaluations, 'Evaluations retrieved successfully');
    }
}
