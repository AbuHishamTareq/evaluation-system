<?php

namespace App\Features\Classification\Repositories;

use App\Models\Rank;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface RankRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Rank;

    public function create(array $data): Rank;

    public function update(int $id, array $data): Rank;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
