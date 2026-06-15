<?php

namespace App\Features\RolesAndPermissions\Services;

use App\Features\RolesAndPermissions\Repositories\PermissionRepositoryInterface;
use App\Models\Permission;
use Illuminate\Pagination\LengthAwarePaginator;

class PermissionService
{
    public function __construct(
        protected PermissionRepositoryInterface $permissionRepository
    ) {}

    public function getAllPermissions(array $filters = []): LengthAwarePaginator
    {
        return $this->permissionRepository->getAll($filters);
    }

    public function getPermissionById(int $id): ?Permission
    {
        return $this->permissionRepository->findById($id);
    }

    public function createPermission(array $data): Permission
    {
        return $this->permissionRepository->create($data);
    }

    public function updatePermission(int $id, array $data): Permission
    {
        $permission = $this->permissionRepository->findById($id);

        if (! $permission) {
            throw new \InvalidArgumentException("Permission not found: {$id}");
        }

        return $this->permissionRepository->update($permission, $data);
    }

    public function deletePermission(int $id): bool
    {
        $permission = $this->permissionRepository->findById($id);

        if (! $permission) {
            return false;
        }

        return $this->permissionRepository->delete($permission);
    }
}
