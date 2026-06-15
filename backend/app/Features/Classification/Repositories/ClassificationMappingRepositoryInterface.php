<?php

namespace App\Features\Classification\Repositories;

use App\Models\ClassificationMapping;
use Illuminate\Pagination\LengthAwarePaginator;

interface ClassificationMappingRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?ClassificationMapping;

    public function resolve(int $fieldId, int $specialtyId, int $rankId): ?ClassificationMapping;

    public function create(array $data): ClassificationMapping;

    public function update(int $id, array $data): ClassificationMapping;

    public function delete(int $id): bool;

    public function exists(int $fieldId, int $specialtyId, int $rankId, ?int $excludeId = null): bool;
}
