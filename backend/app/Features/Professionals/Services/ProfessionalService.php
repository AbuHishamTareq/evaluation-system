<?php

namespace App\Features\Professionals\Services;

use App\Features\Professionals\Repositories\ProfessionalRepositoryInterface;
use App\Models\Professional;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProfessionalService
{
    public function __construct(
        protected ProfessionalRepositoryInterface $professionalRepository
    ) {}

    public function getAllProfessionals(array $filters = []): LengthAwarePaginator
    {
        return $this->professionalRepository->getAll($filters);
    }

    public function getProfessionalById(int $id): ?Professional
    {
        return $this->professionalRepository->findById($id);
    }

    public function createProfessional(array $data): Professional
    {
        return $this->professionalRepository->create($data);
    }

    public function updateProfessional(int $id, array $data): Professional
    {
        return $this->professionalRepository->update($id, $data);
    }

    public function deleteProfessional(int $id): bool
    {
        return $this->professionalRepository->delete($id);
    }

    public function getActiveProfessionals(): Collection
    {
        return $this->professionalRepository->getActive();
    }

    public function searchProfessionals(string $searchTerm): Collection
    {
        return $this->professionalRepository->search($searchTerm);
    }
}
