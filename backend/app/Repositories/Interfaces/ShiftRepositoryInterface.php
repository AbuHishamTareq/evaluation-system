<?php

namespace App\Repositories\Interfaces;

use App\Models\Shift;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ShiftRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function getById(int $id): ?Shift;

    public function create(array $data): Shift;

    public function update(Shift $shift, array $data): Shift;

    public function delete(Shift $shift): bool;

    public function getByDateRange(string $from, string $to, ?int $departmentId = null): Collection;

    public function getByStaffProfile(int $staffProfileId): Collection;

    public function getByDepartment(int $departmentId): Collection;
}
