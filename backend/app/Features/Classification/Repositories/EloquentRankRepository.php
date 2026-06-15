<?php

namespace App\Features\Classification\Repositories;

use App\Models\Rank;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentRankRepository implements RankRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Rank::query();

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

        return $query->orderBy('level', 'asc')->paginate($perPage);
    }

    public function findById(int $id): ?Rank
    {
        return Rank::find($id);
    }

    public function create(array $data): Rank
    {
        return Rank::create($data);
    }

    public function update(int $id, array $data): Rank
    {
        $rank = $this->findById($id);
        if (! $rank) {
            throw new \InvalidArgumentException("Rank not found: {$id}");
        }
        $rank->update($data);

        return $rank->fresh();
    }

    public function delete(int $id): bool
    {
        $rank = $this->findById($id);
        if (! $rank) {
            return false;
        }

        return $rank->delete();
    }

    public function getActive(): Collection
    {
        return Rank::where('is_active', true)->orderBy('level', 'asc')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Rank::where(function ($query) use ($searchTerm) {
            $query->where('name', 'like', "%{$searchTerm}%")
                ->orWhere('description', 'like', "%{$searchTerm}%");
        })->get();
    }
}
