<?php

namespace App\Features\RolesAndPermissions\Repositories;

use App\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface RoleRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Role;

    public function create(array $data): Role;

    public function update(Role $role, array $data): Role;

    public function delete(Role $role): bool;

    public function getPermissions(int $roleId): Collection;

    public function syncPermissions(int $roleId, array $permissionIds): array;

    public function getUsers(int $roleId): Collection;

    public function syncUsers(int $roleId, array $userIds): array;
}
