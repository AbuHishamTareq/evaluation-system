<?php

namespace App\Features\Medications\Repositories;

use App\Models\Medication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface MedicationRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Medication;

    public function create(array $data): Medication;

    public function update(int $id, array $data): Medication;

    public function delete(int $id): bool;

    public function getActive(): Collection;
}
