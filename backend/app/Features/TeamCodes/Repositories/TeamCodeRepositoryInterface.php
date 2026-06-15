<?php

namespace App\Features\TeamCodes\Repositories;

use App\Models\TeamCode;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface TeamCodeRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?TeamCode;

    public function findByCode(string $code): ?TeamCode;

    public function create(array $data): TeamCode;

    public function update(int $id, array $data): TeamCode;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
