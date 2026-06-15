<?php

namespace App\Features\Evaluations\Repositories;

use App\Models\Evaluation;
use Illuminate\Pagination\LengthAwarePaginator;

interface EvaluationRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Evaluation;

    public function create(array $data): Evaluation;

    public function update(int $id, array $data): Evaluation;

    public function delete(int $id): bool;

    public function getByStaff(int $staffId): LengthAwarePaginator;

    public function getByEvaluator(int $evaluatorId): LengthAwarePaginator;

    public function getByStatus(string $status): LengthAwarePaginator;

    public function getByPeriod(string $startDate, string $endDate): LengthAwarePaginator;
}
