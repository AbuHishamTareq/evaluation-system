<?php

namespace App\Features\ActionPlans\Repositories;

use App\Models\ActionPlan;
use Illuminate\Pagination\LengthAwarePaginator;

interface ActionPlanRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?ActionPlan;

    public function create(array $data): ActionPlan;

    public function update(int $id, array $data): ActionPlan;

    public function delete(int $id): bool;

    public function getByEvaluation(int $evaluationId): LengthAwarePaginator;

    public function getByStaff(int $staffId): LengthAwarePaginator;

    public function getByStatus(string $status): LengthAwarePaginator;
}
