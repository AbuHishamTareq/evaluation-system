<?php

namespace App\Features\Medications\Repositories;

use App\Models\PhcMedication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentPhcMedicationRepository implements PhcMedicationRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = PhcMedication::query()->with(['phcCenter', 'medication']);

        if (isset($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (isset($filters['medication_id'])) {
            $query->where('medication_id', $filters['medication_id']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('id')->paginate($perPage);
    }

    public function findByPhcCenter(int $phcCenterId): Collection
    {
        return PhcMedication::with(['medication'])
            ->where('phc_center_id', $phcCenterId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get();
    }

    public function findById(int $id): ?PhcMedication
    {
        return PhcMedication::with(['phcCenter', 'medication'])->find($id);
    }

    public function create(array $data): PhcMedication
    {
        return PhcMedication::create($data);
    }

    public function update(int $id, array $data): PhcMedication
    {
        $phcMedication = $this->findById($id);
        $phcMedication->update($data);

        return $phcMedication->fresh(['phcCenter', 'medication']);
    }

    public function delete(int $id): bool
    {
        $phcMedication = $this->findById($id);

        if (! $phcMedication) {
            return false;
        }

        return $phcMedication->delete();
    }
}
