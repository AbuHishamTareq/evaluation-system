<?php

namespace App\Features\Staff\Repositories;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentStaffRepository implements StaffRepositoryInterface
{
    private const ALLOWED_SORT_FIELDS = [
        'created_at', 'updated_at', 'first_name', 'last_name',
        'employee_id', 'email', 'status', 'is_active',
    ];

    private const ALLOWED_SORT_DIRECTIONS = ['asc', 'desc'];

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Staff::query()->with(['center', 'department', 'professional']);

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('department', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('professional', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        $sortField = in_array($filters['sort_field'] ?? '', self::ALLOWED_SORT_FIELDS)
            ? $filters['sort_field']
            : 'created_at';
        $sortDirection = in_array($filters['sort_direction'] ?? '', self::ALLOWED_SORT_DIRECTIONS)
            ? $filters['sort_direction']
            : 'desc';

        return $query->orderBy($sortField, $sortDirection)->paginate($perPage);
    }

    public function findById(int $id): ?Staff
    {
        return Staff::with(['center', 'user', 'educationalDegrees', 'experiences', 'certifications', 'documents', 'teamCode', 'department', 'clinicAssignment', 'professional'])->find($id);
    }

    public function create(array $data): Staff
    {
        return Staff::create($data);
    }

    public function update(Staff $staff, array $data): Staff
    {
        $staff->update($data);

        return $staff->fresh()->load(['center', 'user', 'educationalDegrees', 'experiences', 'certifications', 'documents', 'teamCode', 'department', 'clinicAssignment', 'professional']);
    }

    public function delete(Staff $staff): bool
    {
        return $staff->delete();
    }

    public function getActive(): Collection
    {
        return Staff::where('is_active', true)
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get();
    }

    public function search(string $query): Collection
    {
        return Staff::with(['center', 'user'])
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('middle_name', 'like', "%{$query}%")
                    ->orWhere('employee_id', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%");
            })
            ->orderBy('first_name')
            ->limit(20)
            ->get();
    }
}
