<?php

namespace App\Features\Departments\Services;

use App\Features\Departments\Repositories\DepartmentRepositoryInterface;
use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class DepartmentService
{
    public function __construct(
        protected DepartmentRepositoryInterface $departmentRepository
    ) {}

    public function getAllDepartments(array $filters = []): LengthAwarePaginator
    {
        return $this->departmentRepository->getAll($filters);
    }

    public function getDepartmentById(int $id): ?Department
    {
        return $this->departmentRepository->findById($id);
    }

    public function createDepartment(array $data): Department
    {
        return $this->departmentRepository->create($data);
    }

    public function updateDepartment(int $id, array $data): Department
    {
        return $this->departmentRepository->update($id, $data);
    }

    public function deleteDepartment(int $id): bool
    {
        return $this->departmentRepository->delete($id);
    }

    public function getActiveDepartments(): Collection
    {
        return $this->departmentRepository->getActive();
    }

    public function searchDepartments(string $searchTerm): Collection
    {
        return $this->departmentRepository->search($searchTerm);
    }
}
