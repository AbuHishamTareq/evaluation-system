<?php

namespace App\Features\MedicationEvaluations\Repositories;

use App\Models\MedicationEvaluation;
use Illuminate\Pagination\LengthAwarePaginator;

interface MedicationEvaluationRepositoryInterface
{
    public function getAll(array $filters): LengthAwarePaginator;

    public function findById(int $id): ?MedicationEvaluation;

    public function create(array $data): MedicationEvaluation;

    public function update(int $id, array $data): MedicationEvaluation;

    public function delete(int $id): bool;
}
