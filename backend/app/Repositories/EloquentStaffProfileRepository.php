<?php

namespace App\Repositories;

use App\Models\StaffProfile;
use App\Repositories\Interfaces\StaffProfileRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentStaffProfileRepository implements StaffProfileRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = StaffProfile::with(['user', 'phcCenter', 'department']);

        if (! empty($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (! empty($filters['employment_status'])) {
            $query->where('employment_status', $filters['employment_status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(static function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('national_id', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate(min($perPage, 100));
    }

    public function getById(int $id): ?StaffProfile
    {
        return StaffProfile::with(['user', 'phcCenter', 'department'])->find($id);
    }

    public function getByUserId(int $userId): ?StaffProfile
    {
        return StaffProfile::where('user_id', $userId)->first();
    }

    public function create(array $data): StaffProfile
    {
        return StaffProfile::create($data);
    }

    public function update(StaffProfile $profile, array $data): StaffProfile
    {
        $profile->update($data);
        $profile->load(['user', 'phcCenter', 'department']);

        return $profile;
    }

    public function delete(StaffProfile $profile): bool
    {
        return $profile->delete();
    }

    public function search(string $query): Collection
    {
        return StaffProfile::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('employee_id', 'like', "%{$query}%")
            ->limit(20)
            ->get();
    }

    public function getActive(): Collection
    {
        return StaffProfile::where('employment_status', 'active')
            ->with(['user', 'phcCenter', 'department'])
            ->get();
    }

    public function getByDepartment(int $departmentId): Collection
    {
        return StaffProfile::where('department_id', $departmentId)
            ->where('employment_status', 'active')
            ->with(['user'])
            ->get();
    }
}
