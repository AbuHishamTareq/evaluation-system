<?php

namespace App\Features\RolesAndPermissions\Repositories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class EloquentRoleRepository implements RoleRepositoryInterface
{
    private const ALLOWED_SORT_FIELDS = [
        'created_at', 'updated_at', 'name', 'description', 'users_count',
    ];

    private const ALLOWED_SORT_DIRECTIONS = ['asc', 'desc'];

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Role::query()->withCount('users');

        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function (Builder $q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);
        $sortField = in_array($filters['sort_field'] ?? '', self::ALLOWED_SORT_FIELDS)
            ? $filters['sort_field']
            : 'created_at';
        $sortDirection = in_array($filters['sort_direction'] ?? '', self::ALLOWED_SORT_DIRECTIONS)
            ? $filters['sort_direction']
            : 'desc';

        return $query->orderBy($sortField, $sortDirection)->paginate($perPage);
    }

    public function findById(int $id): ?Role
    {
        return Role::with('permissions')->find($id);
    }

    public function create(array $data): Role
    {
        $data['guard_name'] = $data['guard_name'] ?? 'web';

        return Role::create($data);
    }

    public function update(Role $role, array $data): Role
    {
        $role->update($data);

        return $role->fresh()->load('permissions');
    }

    public function delete(Role $role): bool
    {
        return $role->delete();
    }

    public function getPermissions(int $roleId): Collection
    {
        return Role::findOrFail($roleId)->permissions()->get();
    }

    public function syncPermissions(int $roleId, array $permissionIds): array
    {
        $role = Role::findOrFail($roleId);

        return $role->permissions()->sync($permissionIds);
    }

    public function getUsers(int $roleId): Collection
    {
        return Role::findOrFail($roleId)->users()->get();
    }

    public function syncUsers(int $roleId, array $userIds): array
    {
        return Role::findOrFail($roleId)->users()->sync($userIds);
    }
}
