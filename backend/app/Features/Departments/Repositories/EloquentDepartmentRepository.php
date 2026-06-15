<?php

namespace App\Features\Departments\Repositories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentDepartmentRepository implements DepartmentRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Department::with('center');

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

        if (isset($filters['center_id'])) {
            $query->where('center_id', $filters['center_id']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): ?Department
    {
        return Department::with('center')->find($id);
    }

    public function create(array $data): Department
    {
        return Department::create($data);
    }

    public function update(int $id, array $data): Department
    {
        $department = $this->findById($id);

        if (! $department) {
            throw new \InvalidArgumentException("Department not found: {$id}");
        }

        $department->update($data);

        return $department->fresh();
    }

    public function delete(int $id): bool
    {
        $department = $this->findById($id);

        if (! $department) {
            return false;
        }

        return $department->delete();
    }

    public function getActive(): Collection
    {
        return Department::with('center')->where('is_active', true)->orderBy('name')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Department::with('center')->where('name', 'like', "%{$searchTerm}%")
            ->orWhere('description', 'like', "%{$searchTerm}%")
            ->orderBy('name')
            ->get();
    }
}
