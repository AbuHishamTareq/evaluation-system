<?php

namespace App\Features\ClinicAssignments\Services;

use App\Features\ClinicAssignments\Repositories\ClinicAssignmentRepositoryInterface;
use App\Models\ClinicAssignment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ClinicAssignmentService
{
    public function __construct(
        protected ClinicAssignmentRepositoryInterface $clinicAssignmentRepository
    ) {}

    public function getAllClinicAssignments(array $filters = []): LengthAwarePaginator
    {
        return $this->clinicAssignmentRepository->getAll($filters);
    }

    public function getClinicAssignmentById(int $id): ?ClinicAssignment
    {
        return $this->clinicAssignmentRepository->findById($id);
    }

    public function createClinicAssignment(array $data): ClinicAssignment
    {
        return $this->clinicAssignmentRepository->create($data);
    }

    public function updateClinicAssignment(int $id, array $data): ClinicAssignment
    {
        return $this->clinicAssignmentRepository->update($id, $data);
    }

    public function deleteClinicAssignment(int $id): bool
    {
        return $this->clinicAssignmentRepository->delete($id);
    }

    public function getActiveClinicAssignments(): Collection
    {
        return $this->clinicAssignmentRepository->getActive();
    }

    public function searchClinicAssignments(string $searchTerm): Collection
    {
        return $this->clinicAssignmentRepository->search($searchTerm);
    }
}
