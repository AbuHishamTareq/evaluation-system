<?php

namespace App\Features\Professionals\Repositories;

use App\Models\Professional;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentProfessionalRepository implements ProfessionalRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Professional::query();

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

    public function findById(int $id): ?Professional
    {
        return Professional::find($id);
    }

    public function create(array $data): Professional
    {
        return Professional::create($data);
    }

    public function update(int $id, array $data): Professional
    {
        $professional = $this->findById($id);

        if (! $professional) {
            throw new \InvalidArgumentException("Professional not found: {$id}");
        }

        $professional->update($data);

        return $professional->fresh();
    }

    public function delete(int $id): bool
    {
        $professional = $this->findById($id);

        if (! $professional) {
            return false;
        }

        return $professional->delete();
    }

    public function getActive(): Collection
    {
        return Professional::where('is_active', true)->orderBy('name')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Professional::where('name', 'like', "%{$searchTerm}%")
            ->orWhere('description', 'like', "%{$searchTerm}%")
            ->orderBy('name')
            ->get();
    }
}
