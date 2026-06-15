<?php

namespace App\Features\Classification\Repositories;

use App\Models\Specialty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface SpecialtyRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Specialty;

    public function findByField(int $fieldId): Collection;

    public function create(array $data): Specialty;

    public function update(int $id, array $data): Specialty;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
