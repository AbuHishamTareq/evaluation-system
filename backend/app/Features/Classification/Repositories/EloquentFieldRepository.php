<?php

namespace App\Features\Classification\Repositories;

use App\Models\Field;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentFieldRepository implements FieldRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Field::query();

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $isActive = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Field
    {
        return Field::with(['specialties'])->find($id);
    }

    public function create(array $data): Field
    {
        return Field::create($data);
    }

    public function update(int $id, array $data): Field
    {
        $field = $this->findById($id);
        if (! $field) {
            throw new \InvalidArgumentException("Field not found: {$id}");
        }
        $field->update($data);

        return $field->fresh();
    }

    public function delete(int $id): bool
    {
        $field = $this->findById($id);
        if (! $field) {
            return false;
        }

        return $field->delete();
    }

    public function getActive(): Collection
    {
        return Field::where('is_active', true)->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Field::where(function ($query) use ($searchTerm) {
            $query->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('description', 'like', "%{$searchTerm}%");
        })->get();
    }
}
