<?php

namespace App\Services\HR;

use App\Models\Shift;
use App\Repositories\Interfaces\ShiftRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ShiftService
{
    public function __construct(
        protected ShiftRepositoryInterface $repository,
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->repository->getAll($filters);
    }

    public function getById(int $id): ?Shift
    {
        return $this->repository->getById($id);
    }

    public function create(array $data): Shift
    {
        return $this->repository->create($data);
    }

    public function update(Shift $shift, array $data): Shift
    {
        return $this->repository->update($shift, $data);
    }

    public function delete(Shift $shift): bool
    {
        return $this->repository->delete($shift);
    }

    public function getDepartmentCoverage(int $departmentId, string $dateFrom, string $dateTo): array
    {
        $shifts = $this->repository->getByDateRange($dateFrom, $dateTo, $departmentId);

        $scheduledShifts = $shifts->where('status', '!=', 'cancelled')->count();
        $required = 3;
        $coverage = $scheduledShifts > 0 ? min(($scheduledShifts / $required) * 100, 100) : 0;

        return [
            'department_id' => $departmentId,
            'required_shifts' => $required,
            'scheduled_shifts' => $scheduledShifts,
            'coverage_percent' => round($coverage, 1),
            'status' => $coverage >= 80 ? 'adequate' : ($coverage >= 50 ? 'warning' : 'critical'),
        ];
    }
}
