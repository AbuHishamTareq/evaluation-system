<?php

namespace App\Features\Classification\Repositories;

use App\Models\Field;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface FieldRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Field;

    public function create(array $data): Field;

    public function update(int $id, array $data): Field;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
