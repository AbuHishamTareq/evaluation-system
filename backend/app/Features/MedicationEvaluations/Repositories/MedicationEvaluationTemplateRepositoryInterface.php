<?php

namespace App\Features\MedicationEvaluations\Repositories;

use App\Models\MedicationEvaluationTemplate;
use Illuminate\Pagination\LengthAwarePaginator;

interface MedicationEvaluationTemplateRepositoryInterface
{
    public function getAll(array $filters): LengthAwarePaginator;

    public function findById(int $id): ?MedicationEvaluationTemplate;

    public function create(array $data): MedicationEvaluationTemplate;

    public function update(int $id, array $data): MedicationEvaluationTemplate;

    public function delete(int $id): bool;
}
