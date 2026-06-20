<?php

namespace App\Features\Medications\Repositories;

use App\Models\PhcMedication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PhcMedicationRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findByPhcCenter(int $phcCenterId): Collection;

    public function findById(int $id): ?PhcMedication;

    public function create(array $data): PhcMedication;

    public function update(int $id, array $data): PhcMedication;

    public function delete(int $id): bool;
}
