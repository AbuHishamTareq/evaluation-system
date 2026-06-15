<?php

namespace App\Features\Classification\Services;

use App\Features\Classification\Repositories\ClassificationMappingRepositoryInterface;
use App\Models\Category;
use App\Models\ClassificationMapping;
use Illuminate\Pagination\LengthAwarePaginator;

class ClassificationService
{
    public function __construct(
        protected ClassificationMappingRepositoryInterface $mappingRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->mappingRepository->getAll($filters);
    }

    public function findById(int $id): ?ClassificationMapping
    {
        return $this->mappingRepository->findById($id);
    }

    public function resolve(int $fieldId, int $specialtyId, int $rankId): ?ClassificationMapping
    {
        return $this->mappingRepository->resolve($fieldId, $specialtyId, $rankId);
    }

    public function create(array $data): ClassificationMapping
    {
        return $this->mappingRepository->create($data);
    }

    public function update(int $id, array $data): ClassificationMapping
    {
        return $this->mappingRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->mappingRepository->delete($id);
    }

    public function getCategory(int $fieldId, int $specialtyId, int $rankId): ?Category
    {
        return ClassificationMapping::where('field_id', $fieldId)
            ->where('specialty_id', $specialtyId)
            ->where('rank_id', $rankId)
            ->first()?->category;
    }

    public function mappingExists(int $fieldId, int $specialtyId, int $rankId, ?int $excludeId = null): bool
    {
        return $this->mappingRepository->exists($fieldId, $specialtyId, $rankId, $excludeId);
    }
}
