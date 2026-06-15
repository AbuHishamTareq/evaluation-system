<?php

namespace App\Features\ClinicAssignments\Repositories;

use App\Models\ClinicAssignment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentClinicAssignmentRepository implements ClinicAssignmentRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = ClinicAssignment::query();

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

    public function findById(int $id): ?ClinicAssignment
    {
        return ClinicAssignment::find($id);
    }

    public function create(array $data): ClinicAssignment
    {
        return ClinicAssignment::create($data);
    }

    public function update(int $id, array $data): ClinicAssignment
    {
        $clinicAssignment = $this->findById($id);

        if (! $clinicAssignment) {
            throw new \InvalidArgumentException("Clinic Assignment not found: {$id}");
        }

        $clinicAssignment->update($data);

        return $clinicAssignment->fresh();
    }

    public function delete(int $id): bool
    {
        $clinicAssignment = $this->findById($id);

        if (! $clinicAssignment) {
            return false;
        }

        return $clinicAssignment->delete();
    }

    public function getActive(): Collection
    {
        return ClinicAssignment::where('is_active', true)->orderBy('name')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return ClinicAssignment::where('name', 'like', "%{$searchTerm}%")
            ->orWhere('description', 'like', "%{$searchTerm}%")
            ->orderBy('name')
            ->get();
    }
}
