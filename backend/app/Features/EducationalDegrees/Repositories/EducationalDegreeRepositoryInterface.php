<?php

namespace App\Features\EducationalDegrees\Repositories;

use App\Models\EducationalDegree;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface EducationalDegreeRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?EducationalDegree;

    public function create(array $data): EducationalDegree;

    public function update(int $id, array $data): EducationalDegree;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
