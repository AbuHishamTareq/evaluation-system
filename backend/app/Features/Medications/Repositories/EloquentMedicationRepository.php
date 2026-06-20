<?php

namespace App\Features\Medications\Repositories;

use App\Models\Medication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentMedicationRepository implements MedicationRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Medication::query()->withCount('phcMedications');

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('strength', 'like', "%{$filters['search']}%")
                    ->orWhere('form', 'like', "%{$filters['search']}%")
                    ->orWhere('category', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('name')->paginate($perPage);
    }

    public function findById(int $id): ?Medication
    {
        return Medication::with('phcMedications.phcCenter')->find($id);
    }

    public function create(array $data): Medication
    {
        return Medication::create($data);
    }

    public function update(int $id, array $data): Medication
    {
        $medication = $this->findById($id);
        $medication->update($data);

        return $medication->fresh();
    }

    public function delete(int $id): bool
    {
        $medication = $this->findById($id);

        if (! $medication) {
            return false;
        }

        return $medication->delete();
    }

    public function getActive(): Collection
    {
        return Medication::where('is_active', true)->orderBy('name')->get();
    }
}
