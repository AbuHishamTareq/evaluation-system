<?php

namespace App\Features\EducationalDegrees\Repositories;

use App\Models\EducationalDegree;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentEducationalDegreeRepository implements EducationalDegreeRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = EducationalDegree::query();

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): ?EducationalDegree
    {
        return EducationalDegree::find($id);
    }

    public function create(array $data): EducationalDegree
    {
        return EducationalDegree::create($data);
    }

    public function update(int $id, array $data): EducationalDegree
    {
        $degree = $this->findById($id);

        if (! $degree) {
            throw new \InvalidArgumentException("Educational degree not found: {$id}");
        }

        $degree->update($data);

        return $degree->fresh();
    }

    public function delete(int $id): bool
    {
        $degree = $this->findById($id);

        if (! $degree) {
            return false;
        }

        return $degree->delete();
    }

    public function getActive(): Collection
    {
        return EducationalDegree::where('is_active', true)->orderBy('name')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return EducationalDegree::where('name', 'like', "%{$searchTerm}%")
            ->orWhere('description', 'like', "%{$searchTerm}%")
            ->orderBy('name')
            ->get();
    }
}
