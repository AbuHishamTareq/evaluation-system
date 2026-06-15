<?php

namespace App\Features\Professionals\Repositories;

use App\Models\Professional;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ProfessionalRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Professional;

    public function create(array $data): Professional;

    public function update(int $id, array $data): Professional;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
