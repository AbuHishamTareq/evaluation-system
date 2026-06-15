<?php

namespace App\Features\ClinicAssignments\Repositories;

use App\Models\ClinicAssignment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ClinicAssignmentRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?ClinicAssignment;

    public function create(array $data): ClinicAssignment;

    public function update(int $id, array $data): ClinicAssignment;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function search(string $searchTerm): Collection;
}
