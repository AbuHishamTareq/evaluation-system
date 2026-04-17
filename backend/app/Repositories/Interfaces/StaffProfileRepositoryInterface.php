<?php

namespace App\Repositories\Interfaces;

use App\Models\StaffProfile;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface StaffProfileRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function getById(int $id): ?StaffProfile;

    public function getByUserId(int $userId): ?StaffProfile;

    public function create(array $data): StaffProfile;

    public function update(StaffProfile $profile, array $data): StaffProfile;

    public function delete(StaffProfile $profile): bool;

    public function search(string $query): Collection;

    public function getActive(): Collection;

    public function getByDepartment(int $departmentId): Collection;
}
