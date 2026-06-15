<?php

namespace App\Features\Classification\Services;

use App\Features\Classification\Repositories\SpecialtyRepositoryInterface;
use App\Models\Specialty;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class SpecialtyService
{
    public function __construct(
        protected SpecialtyRepositoryInterface $specialtyRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->specialtyRepository->getAll($filters);
    }

    public function findById(int $id): ?Specialty
    {
        return $this->specialtyRepository->findById($id);
    }

    public function findByField(int $fieldId): Collection
    {
        return $this->specialtyRepository->findByField($fieldId);
    }

    public function create(array $data): Specialty
    {
        return $this->specialtyRepository->create($data);
    }

    public function update(int $id, array $data): Specialty
    {
        return $this->specialtyRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->specialtyRepository->delete($id);
    }

    public function getActive(): Collection
    {
        return $this->specialtyRepository->getActive();
    }

    public function search(string $searchTerm): Collection
    {
        return $this->specialtyRepository->search($searchTerm);
    }
}
