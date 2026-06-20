<?php

namespace App\Features\Medications\Services;

use App\Features\Medications\Repositories\PhcMedicationRepositoryInterface;
use App\Models\PhcMedication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class PhcMedicationService
{
    public function __construct(
        protected PhcMedicationRepositoryInterface $phcMedicationRepository
    ) {}

    public function getAllPhcMedications(array $filters = []): LengthAwarePaginator
    {
        return $this->phcMedicationRepository->getAll($filters);
    }

    public function getPhcMedicationsByCenter(int $phcCenterId): Collection
    {
        return $this->phcMedicationRepository->findByPhcCenter($phcCenterId);
    }

    public function getPhcMedicationById(int $id): ?PhcMedication
    {
        return $this->phcMedicationRepository->findById($id);
    }

    public function createPhcMedication(array $data): PhcMedication
    {
        if (! isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        return $this->phcMedicationRepository->create($data);
    }

    public function updatePhcMedication(int $id, array $data): PhcMedication
    {
        return $this->phcMedicationRepository->update($id, $data);
    }

    public function deletePhcMedication(int $id): bool
    {
        return $this->phcMedicationRepository->delete($id);
    }
}
