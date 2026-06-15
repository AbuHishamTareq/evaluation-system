<?php

namespace App\Features\Centers\Repositories;

use App\Models\PhcCenter;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentCenterRepository implements CenterRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = PhcCenter::query()->with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }]);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%")
                    ->orWhere('address', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }

        if (isset($filters['classification'])) {
            $query->where('classification', $filters['classification']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): ?PhcCenter
    {
        return PhcCenter::with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }])->find($id);
    }

    public function findByCode(string $code): ?PhcCenter
    {
        return PhcCenter::with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }])->where('code', $code)->first();
    }

    public function create(array $data): PhcCenter
    {
        return PhcCenter::create($data);
    }

    public function update(int $id, array $data): PhcCenter
    {
        $center = $this->findById($id);
        $center->update($data);

        return $center->fresh('zone');
    }

    public function delete(int $id): bool
    {
        $center = $this->findById($id);

        if (! $center) {
            return false;
        }

        return $center->delete();
    }

    public function getActive(?int $zoneId = null): Collection
    {
        $query = PhcCenter::with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }])->where('is_active', true);

        if ($zoneId !== null) {
            $query->where('zone_id', $zoneId);
        }

        return $query->orderBy('name')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return PhcCenter::with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }])
            ->where('name', 'like', "%{$searchTerm}%")
            ->orWhere('code', 'like', "%{$searchTerm}%")
            ->orWhere('address', 'like', "%{$searchTerm}%")
            ->limit(20)
            ->get();
    }

    public function getByZone(int $zoneId): Collection
    {
        return PhcCenter::with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }])
            ->where('zone_id', $zoneId)
            ->orderBy('name')
            ->get();
    }

    public function getByClassification(string $classification): Collection
    {
        return PhcCenter::with('zone')->withCount(['staff' => function ($q) {
            $q->where('is_active', true);
        }])
            ->where('classification', $classification)
            ->orderBy('name')
            ->get();
    }

    public function findByZoneName(string $zoneName): ?PhcCenter
    {
        return PhcCenter::whereHas('zone', function ($query) use ($zoneName) {
            $query->where('name', 'like', "%{$zoneName}%");
        })->first();
    }
}
