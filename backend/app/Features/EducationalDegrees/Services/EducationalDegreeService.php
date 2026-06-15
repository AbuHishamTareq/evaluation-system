<?php

namespace App\Features\EducationalDegrees\Services;

use App\Features\EducationalDegrees\Repositories\EducationalDegreeRepositoryInterface;
use App\Models\EducationalDegree;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EducationalDegreeService
{
    public function __construct(
        protected EducationalDegreeRepositoryInterface $educationalDegreeRepository
    ) {}

    public function getAllEducationalDegrees(array $filters = []): LengthAwarePaginator
    {
        return $this->educationalDegreeRepository->getAll($filters);
    }

    public function getEducationalDegreeById(int $id): ?EducationalDegree
    {
        return $this->educationalDegreeRepository->findById($id);
    }

    public function createEducationalDegree(array $data): EducationalDegree
    {
        return $this->educationalDegreeRepository->create($data);
    }

    public function updateEducationalDegree(int $id, array $data): EducationalDegree
    {
        return $this->educationalDegreeRepository->update($id, $data);
    }

    public function deleteEducationalDegree(int $id): bool
    {
        return $this->educationalDegreeRepository->delete($id);
    }

    public function getActiveEducationalDegrees(): Collection
    {
        return $this->educationalDegreeRepository->getActive();
    }

    public function searchEducationalDegrees(string $searchTerm): Collection
    {
        return $this->educationalDegreeRepository->search($searchTerm);
    }
}
