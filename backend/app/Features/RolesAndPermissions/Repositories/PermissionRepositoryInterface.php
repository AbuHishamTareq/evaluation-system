<?php

namespace App\Features\RolesAndPermissions\Repositories;

use App\Models\Permission;
use Illuminate\Pagination\LengthAwarePaginator;

interface PermissionRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Permission;

    public function create(array $data): Permission;

    public function update(Permission $permission, array $data): Permission;

    public function delete(Permission $permission): bool;
}
