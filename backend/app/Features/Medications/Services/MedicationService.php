<?php

namespace App\Features\Medications\Services;

use App\Features\Medications\Repositories\MedicationRepositoryInterface;
use App\Models\Medication;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class MedicationService
{
    public function __construct(
        protected MedicationRepositoryInterface $medicationRepository
    ) {}

    public function getAllMedications(array $filters = []): LengthAwarePaginator
    {
        return $this->medicationRepository->getAll($filters);
    }

    public function getMedicationById(int $id): ?Medication
    {
        return $this->medicationRepository->findById($id);
    }

    public function createMedication(array $data): Medication
    {
        if (! isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        return $this->medicationRepository->create($data);
    }

    public function updateMedication(int $id, array $data): Medication
    {
        return $this->medicationRepository->update($id, $data);
    }

    public function deleteMedication(int $id): bool
    {
        return $this->medicationRepository->delete($id);
    }

    public function getActiveMedications(): Collection
    {
        return $this->medicationRepository->getActive();
    }
}
