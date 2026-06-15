<?php

namespace App\Features\ActionPlans\Controllers;

use App\Features\ActionPlans\Services\ActionPlanService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Action Plans
 *
 * APIs for managing improvement action plans tied to evaluations.
 */
class ActionPlanController extends BaseApiController
{
    public function __construct(
        protected ActionPlanService $actionPlanService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'staff_id', 'evaluation_id', 'per_page']);
        $actionPlans = $this->actionPlanService->getAllActionPlans($filters);

        return $this->paginatedResponse($actionPlans, 'Action plans retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'staff_id' => 'required|integer|exists:users,id',
            'evaluation_id' => 'required|integer|exists:evaluations,id',
            'due_date' => 'required|date',
            'priority' => 'nullable|string|in:low,medium,high',
            'status' => 'nullable|string|in:pending,in_progress,completed',
        ]);

        $actionPlan = $this->actionPlanService->createActionPlan($validated);

        return $this->successResponse($actionPlan, 'Action plan created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $actionPlan = $this->actionPlanService->getActionPlanById($id);

        if (! $actionPlan) {
            return $this->errorResponse('Action plan not found', 404);
        }

        return $this->successResponse($actionPlan, 'Action plan retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'staff_id' => 'sometimes|integer|exists:users,id',
            'evaluation_id' => 'sometimes|integer|exists:evaluations,id',
            'due_date' => 'sometimes|date',
            'priority' => 'nullable|string|in:low,medium,high',
            'status' => 'nullable|string|in:pending,in_progress,completed',
        ]);

        $actionPlan = $this->actionPlanService->updateActionPlan($id, $validated);

        return $this->successResponse($actionPlan, 'Action plan updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->actionPlanService->deleteActionPlan($id);

        if (! $deleted) {
            return $this->errorResponse('Action plan not found', 404);
        }

        return $this->successResponse(null, 'Action plan deleted successfully');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed',
        ]);

        try {
            $actionPlan = $this->actionPlanService->updateStatus($id, $validated['status']);

            return $this->successResponse($actionPlan, 'Action plan status updated successfully');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    public function byEvaluation(int $evaluationId): JsonResponse
    {
        $actionPlans = $this->actionPlanService->getActionPlansByEvaluation($evaluationId);

        return $this->paginatedResponse($actionPlans, 'Action plans retrieved successfully');
    }

    public function byStaff(int $staffId): JsonResponse
    {
        $actionPlans = $this->actionPlanService->getActionPlansByStaff($staffId);

        return $this->paginatedResponse($actionPlans, 'Action plans retrieved successfully');
    }

    public function summary(int $staffId): JsonResponse
    {
        $summary = $this->actionPlanService->getActionPlanSummary($staffId);

        return $this->successResponse($summary, 'Action plan summary retrieved successfully');
    }
}
