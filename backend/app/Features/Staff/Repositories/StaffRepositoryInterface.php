<?php

namespace App\Features\Staff\Repositories;

use App\Models\Staff;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface StaffRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Staff;

    public function create(array $data): Staff;

    public function update(Staff $staff, array $data): Staff;

    public function delete(Staff $staff): bool;

    public function getActive(): Collection;

    public function search(string $query): Collection;
}
