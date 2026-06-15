<?php

namespace App\Features\Classification\Repositories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface CategoryRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Category;

    public function create(array $data): Category;

    public function update(int $id, array $data): Category;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
