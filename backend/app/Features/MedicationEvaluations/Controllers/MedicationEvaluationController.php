<?php

namespace App\Features\MedicationEvaluations\Controllers;

use App\Features\MedicationEvaluations\Services\MedicationEvaluationService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Medication Evaluations
 *
 * APIs for managing medication evaluations
 */
class MedicationEvaluationController extends BaseApiController
{
    public function __construct(
        protected MedicationEvaluationService $evaluationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'template_id',
            'phc_center_id',
            'evaluator_id',
            'status',
            'per_page',
        ]);

        $evaluations = $this->evaluationService->getAll($filters);

        return $this->paginatedResponse($evaluations, 'Evaluations retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:medication_evaluation_templates,id',
            'phc_center_id' => 'required|exists:phc_centers,id',
        ]);

        $validated['evaluator_id'] = $request->user()->id;

        $evaluation = $this->evaluationService->create($validated);

        return $this->successResponse($evaluation, 'Evaluation created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $evaluation = $this->evaluationService->getById($id);

        if (! $evaluation) {
            return $this->errorResponse('Evaluation not found', 404);
        }

        return $this->successResponse($evaluation, 'Evaluation retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $evaluation = $this->evaluationService->getById($id);

        if (! $evaluation) {
            return $this->errorResponse('Evaluation not found', 404);
        }

        $validated = $request->validate([
            'status' => 'nullable|in:draft,in_progress,completed',
            'notes' => 'nullable|string',
            'answers' => 'nullable|array',
            'answers.*.template_medication_id' => 'required|exists:medication_evaluation_template_medications,id',
            'answers.*.criterion_id' => 'required|exists:medication_evaluation_template_criteria,id',
            'answers.*.answer_value' => 'nullable|string',
            'answers.*.comment' => 'nullable|string',
        ]);

        $evaluation = $this->evaluationService->update($id, $validated);

        return $this->successResponse($evaluation, 'Evaluation updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $evaluation = $this->evaluationService->getById($id);

        if (! $evaluation) {
            return $this->errorResponse('Evaluation not found', 404);
        }

        $this->evaluationService->delete($id);

        return $this->successResponse(null, 'Evaluation deleted successfully');
    }
}
