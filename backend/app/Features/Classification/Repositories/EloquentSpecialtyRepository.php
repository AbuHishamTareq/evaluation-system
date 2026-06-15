<?php

namespace App\Features\Classification\Repositories;

use App\Models\Specialty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentSpecialtyRepository implements SpecialtyRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Specialty::query()->with(['field']);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['field_id'])) {
            $query->where('field_id', $filters['field_id']);
        }

        if (isset($filters['is_active'])) {
            $isActive = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Specialty
    {
        return Specialty::with(['field'])->find($id);
    }

    public function findByField(int $fieldId): Collection
    {
        return Specialty::where('field_id', $fieldId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Specialty
    {
        return Specialty::create($data);
    }

    public function update(int $id, array $data): Specialty
    {
        $specialty = $this->findById($id);
        if (! $specialty) {
            throw new \InvalidArgumentException("Specialty not found: {$id}");
        }
        $specialty->update($data);

        return $specialty->fresh();
    }

    public function delete(int $id): bool
    {
        $specialty = $this->findById($id);
        if (! $specialty) {
            return false;
        }

        return $specialty->delete();
    }

    public function getActive(): Collection
    {
        return Specialty::where('is_active', true)->with(['field'])->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Specialty::where(function ($query) use ($searchTerm) {
            $query->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('description', 'like', "%{$searchTerm}%");
        })->with(['field'])->get();
    }
}
