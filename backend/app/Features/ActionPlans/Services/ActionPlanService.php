<?php

namespace App\Features\ActionPlans\Services;

use App\Features\ActionPlans\Repositories\ActionPlanRepositoryInterface;
use App\Models\ActionPlan;
use Illuminate\Pagination\LengthAwarePaginator;

class ActionPlanService
{
    public function __construct(
        protected ActionPlanRepositoryInterface $actionPlanRepository
    ) {}

    public function getAllActionPlans(array $filters = []): LengthAwarePaginator
    {
        return $this->actionPlanRepository->getAll($filters);
    }

    public function getActionPlanById(int $id): ?ActionPlan
    {
        return $this->actionPlanRepository->findById($id);
    }

    public function createActionPlan(array $data): ActionPlan
    {
        return $this->actionPlanRepository->create($data);
    }

    public function updateActionPlan(int $id, array $data): ActionPlan
    {
        return $this->actionPlanRepository->update($id, $data);
    }

    public function deleteActionPlan(int $id): bool
    {
        return $this->actionPlanRepository->delete($id);
    }

    public function getActionPlansByEvaluation(int $evaluationId): LengthAwarePaginator
    {
        return $this->actionPlanRepository->getByEvaluation($evaluationId);
    }

    public function getActionPlansByStaff(int $staffId): LengthAwarePaginator
    {
        return $this->actionPlanRepository->getByStaff($staffId);
    }

    public function updateStatus(int $id, string $status): ActionPlan
    {
        $actionPlan = $this->getActionPlanById($id);

        if (! $actionPlan) {
            throw new \RuntimeException('Action plan not found');
        }

        $updateData = ['status' => $status];

        if ($status === 'completed') {
            $updateData['completed_at'] = now();
        }

        return $this->actionPlanRepository->update($id, $updateData);
    }

    public function getActionPlanSummary(int $staffId): array
    {
        $actionPlans = ActionPlan::where('staff_id', $staffId)->get();

        return [
            'total' => $actionPlans->count(),
            'pending' => $actionPlans->where('status', 'pending')->count(),
            'in_progress' => $actionPlans->where('status', 'in_progress')->count(),
            'completed' => $actionPlans->where('status', 'completed')->count(),
            'overdue' => $actionPlans->where('status', 'pending')
                ->where('due_date', '<', now())
                ->count(),
        ];
    }
}
