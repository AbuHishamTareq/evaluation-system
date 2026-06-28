<?php

namespace App\Features\RolesAndPermissions\Repositories;

use App\Models\Permission;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentPermissionRepository implements PermissionRepositoryInterface
{
    private const ALLOWED_SORT_FIELDS = [
        'created_at', 'updated_at', 'name', 'description',
    ];

    private const ALLOWED_SORT_DIRECTIONS = ['asc', 'desc'];

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Permission::query()->with('roles');

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

    public function findById(int $id): ?Permission
    {
        return Permission::with('roles')->find($id);
    }

    public function create(array $data): Permission
    {
        $data['guard_name'] = $data['guard_name'] ?? 'web';

        return Permission::create($data);
    }

    public function update(Permission $permission, array $data): Permission
    {
        $permission->update($data);

        return $permission->fresh()->load('roles');
    }

    public function delete(Permission $permission): bool
    {
        return $permission->delete();
    }
}
