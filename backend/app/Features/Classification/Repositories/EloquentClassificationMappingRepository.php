<?php

namespace App\Features\Classification\Repositories;

use App\Models\ClassificationMapping;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentClassificationMappingRepository implements ClassificationMappingRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = ClassificationMapping::query()
            ->with(['field', 'specialty', 'rank', 'category']);

        if (isset($filters['field_id'])) {
            $query->where('field_id', $filters['field_id']);
        }

        if (isset($filters['specialty_id'])) {
            $query->where('specialty_id', $filters['specialty_id']);
        }

        if (isset($filters['rank_id'])) {
            $query->where('rank_id', $filters['rank_id']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?ClassificationMapping
    {
        return ClassificationMapping::with(['field', 'specialty', 'rank', 'category'])->find($id);
    }

    public function resolve(int $fieldId, int $specialtyId, int $rankId): ?ClassificationMapping
    {
        return ClassificationMapping::with(['field', 'specialty', 'rank', 'category'])
            ->where('field_id', $fieldId)
            ->where('specialty_id', $specialtyId)
            ->where('rank_id', $rankId)
            ->first();
    }

    public function create(array $data): ClassificationMapping
    {
        return ClassificationMapping::create($data);
    }

    public function update(int $id, array $data): ClassificationMapping
    {
        $mapping = $this->findById($id);
        if (! $mapping) {
            throw new \InvalidArgumentException("Classification mapping not found: {$id}");
        }
        $mapping->update($data);

        return $mapping->fresh(['field', 'specialty', 'rank', 'category']);
    }

    public function delete(int $id): bool
    {
        $mapping = $this->findById($id);
        if (! $mapping) {
            return false;
        }

        return $mapping->delete();
    }

    public function exists(int $fieldId, int $specialtyId, int $rankId, ?int $excludeId = null): bool
    {
        $query = ClassificationMapping::query()
            ->where('field_id', $fieldId)
            ->where('specialty_id', $specialtyId)
            ->where('rank_id', $rankId);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }
}
