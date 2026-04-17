<?php

namespace App\Repositories;

use App\Models\Shift;
use App\Repositories\Interfaces\ShiftRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentShiftRepository implements ShiftRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Shift::with(['staffProfile', 'department']);

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (! empty($filters['staff_profile_id'])) {
            $query->where('staff_profile_id', $filters['staff_profile_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (! empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate(min($perPage, 100));
    }

    public function getById(int $id): ?Shift
    {
        return Shift::with(['staffProfile', 'department'])->find($id);
    }

    public function create(array $data): Shift
    {
        return Shift::create($data);
    }

    public function update(Shift $shift, array $data): Shift
    {
        $shift->update($data);
        $shift->load(['staffProfile', 'department']);

        return $shift;
    }

    public function delete(Shift $shift): bool
    {
        return $shift->delete();
    }

    public function getByDateRange(string $from, string $to, ?int $departmentId = null): Collection
    {
        $query = Shift::with(['staffProfile', 'department'])
            ->whereBetween('date', [$from, $to])
            ->where('status', '!=', 'cancelled');

        if ($departmentId) {
            $query->where('department_id', $departmentId);
        }

        return $query->get();
    }

    public function getByStaffProfile(int $staffProfileId): Collection
    {
        return Shift::where('staff_profile_id', $staffProfileId)
            ->with(['department'])
            ->orderBy('date')
            ->get();
    }

    public function getByDepartment(int $departmentId): Collection
    {
        return Shift::where('department_id', $departmentId)
            ->with(['staffProfile'])
            ->orderBy('date')
            ->get();
    }
}
