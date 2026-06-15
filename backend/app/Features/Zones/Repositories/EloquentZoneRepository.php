<?php

namespace App\Features\Zones\Repositories;

use App\Models\Zone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentZoneRepository implements ZoneRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Zone::query()->with(['parent', 'children']);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['level'])) {
            $query->where('level', $filters['level']);
        }

        if (isset($filters['parent_id'])) {
            $query->where('parent_id', $filters['parent_id']);
        }

        if (isset($filters['parent_id']) && $filters['parent_id'] === null) {
            $query->whereNull('parent_id');
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): ?Zone
    {
        return Zone::with(['parent', 'children', 'centers'])->find($id);
    }

    public function findByCode(string $code): ?Zone
    {
        return Zone::with(['parent', 'children'])->where('code', $code)->first();
    }

    public function create(array $data): Zone
    {
        return Zone::create($data);
    }

    public function update(int $id, array $data): Zone
    {
        $zone = $this->findById($id);
        $zone->update($data);

        return $zone->fresh(['parent', 'children']);
    }

    public function delete(int $id): bool
    {
        $zone = $this->findById($id);

        if (! $zone) {
            return false;
        }

        return $zone->delete();
    }

    public function getRootZones(): Collection
    {
        return Zone::with('children')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();
    }

    public function getChildren(int $parentId): Collection
    {
        return Zone::with('children')
            ->where('parent_id', $parentId)
            ->orderBy('name')
            ->get();
    }

    public function getTree(): Collection
    {
        return Zone::with('children')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Zone::with(['parent', 'children'])
            ->where('name', 'like', "%{$searchTerm}%")
            ->orWhere('code', 'like', "%{$searchTerm}%")
            ->limit(20)
            ->get();
    }

    public function getByLevel(string $level): Collection
    {
        return Zone::with(['parent', 'children'])
            ->where('level', $level)
            ->orderBy('name')
            ->get();
    }
}
