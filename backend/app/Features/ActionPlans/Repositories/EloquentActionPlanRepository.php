<?php

namespace App\Features\ActionPlans\Repositories;

use App\Models\ActionPlan;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentActionPlanRepository implements ActionPlanRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = ActionPlan::query();

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['staff_id'])) {
            $query->where('staff_id', $filters['staff_id']);
        }

        if (! empty($filters['evaluation_id'])) {
            $query->where('evaluation_id', $filters['evaluation_id']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    public function findById(int $id): ?ActionPlan
    {
        return ActionPlan::find($id);
    }

    public function create(array $data): ActionPlan
    {
        return ActionPlan::create($data);
    }

    public function update(int $id, array $data): ActionPlan
    {
        $actionPlan = $this->findById($id);

        if (! $actionPlan) {
            throw new \RuntimeException('Action plan not found');
        }

        $actionPlan->update($data);

        return $actionPlan->fresh();
    }

    public function delete(int $id): bool
    {
        $actionPlan = $this->findById($id);

        if (! $actionPlan) {
            return false;
        }

        return $actionPlan->delete();
    }

    public function getByEvaluation(int $evaluationId): LengthAwarePaginator
    {
        return ActionPlan::where('evaluation_id', $evaluationId)->paginate();
    }

    public function getByStaff(int $staffId): LengthAwarePaginator
    {
        return ActionPlan::where('staff_id', $staffId)->paginate();
    }

    public function getByStatus(string $status): LengthAwarePaginator
    {
        return ActionPlan::where('status', $status)->paginate();
    }
}
