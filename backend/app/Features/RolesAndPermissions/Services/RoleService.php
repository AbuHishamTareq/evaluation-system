<?php

namespace App\Features\RolesAndPermissions\Services;

use App\Features\RolesAndPermissions\Repositories\RoleRepositoryInterface;
use App\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class RoleService
{
    public function __construct(
        protected RoleRepositoryInterface $roleRepository
    ) {}

    public function getAllRoles(array $filters = []): LengthAwarePaginator
    {
        return $this->roleRepository->getAll($filters);
    }

    public function getRoleById(int $id): ?Role
    {
        return $this->roleRepository->findById($id);
    }

    public function createRole(array $data): Role
    {
        return $this->roleRepository->create($data);
    }

    public function updateRole(int $id, array $data): Role
    {
        $role = $this->roleRepository->findById($id);

        if (! $role) {
            throw new \InvalidArgumentException("Role not found: {$id}");
        }

        return $this->roleRepository->update($role, $data);
    }

    public function deleteRole(int $id): bool
    {
        $role = $this->roleRepository->findById($id);

        if (! $role) {
            return false;
        }

        return $this->roleRepository->delete($role);
    }

    public function getRolePermissions(int $id): Collection
    {
        return $this->roleRepository->getPermissions($id);
    }

    public function syncRolePermissions(int $id, array $permissionIds): array
    {
        return $this->roleRepository->syncPermissions($id, $permissionIds);
    }

    public function getRoleUsers(int $id): Collection
    {
        return $this->roleRepository->getUsers($id);
    }

    public function syncRoleUsers(int $id, array $userIds): array
    {
        return $this->roleRepository->syncUsers($id, $userIds);
    }
}
