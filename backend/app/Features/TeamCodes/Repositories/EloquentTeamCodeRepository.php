<?php

namespace App\Features\TeamCodes\Repositories;

use App\Models\TeamCode;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentTeamCodeRepository implements TeamCodeRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = TeamCode::query()->with(['center']);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('code', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $isActive = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        if (isset($filters['center_id'])) {
            $query->where('center_id', $filters['center_id']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?TeamCode
    {
        return TeamCode::with(['center', 'staff'])->find($id);
    }

    public function findByCode(string $code): ?TeamCode
    {
        return TeamCode::where('code', $code)->first();
    }

    public function create(array $data): TeamCode
    {
        return TeamCode::create($data);
    }

    public function update(int $id, array $data): TeamCode
    {
        $teamCode = $this->findById($id);
        if (! $teamCode) {
            throw new \InvalidArgumentException("TeamCode not found: {$id}");
        }
        $teamCode->update($data);

        return $teamCode->fresh();
    }

    public function delete(int $id): bool
    {
        $teamCode = $this->findById($id);
        if (! $teamCode) {
            return false;
        }

        return $teamCode->delete();
    }

    public function getActive(): Collection
    {
        return TeamCode::where('is_active', true)->with(['center'])->get();
    }

    public function search(string $searchTerm): Collection
    {
        return TeamCode::where(function ($query) use ($searchTerm) {
            $query->where('code', 'like', "%{$searchTerm}%")
                ->orWhere('description', 'like', "%{$searchTerm}%");
        })->with(['center'])->get();
    }
}
