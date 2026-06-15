<?php

namespace App\Features\Departments\Repositories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface DepartmentRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Department;

    public function create(array $data): Department;

    public function update(int $id, array $data): Department;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
