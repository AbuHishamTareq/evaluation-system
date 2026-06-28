<?php

namespace App\Features\Users\Repositories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentUserRepository implements UserRepositoryInterface
{
    private const ALLOWED_SORT_FIELDS = [
        'created_at', 'updated_at', 'name', 'email',
        'employee_id', 'role', 'is_active',
    ];

    private const ALLOWED_SORT_DIRECTIONS = ['asc', 'desc'];

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = User::query()->with('roles')->withCount('roles');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
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

    public function findById(int $id): ?User
    {
        return User::with('roles')->withCount('roles')->find($id);
    }

    public function create(array $data): User
    {
        $user = User::create($data);

        $this->syncRoleFromColumn($user, $data['role'] ?? 'staff');

        return $user->fresh()->load('roles')->loadCount('roles');
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        if (isset($data['role'])) {
            $this->syncRoleFromColumn($user, $data['role']);
        }

        return $user->fresh()->load('roles')->loadCount('roles');
    }

    private function syncRoleFromColumn(User $user, string $role): void
    {
        $pivotRole = match ($role) {
            'admin' => 'Super Admin',
            'manager' => 'Manager',
            'evaluator' => 'Evaluator',
            'staff' => 'Staff',
            default => 'Staff',
        };

        $roleModel = Role::where('name', $pivotRole)->first();
        if ($roleModel) {
            $user->roles()->sync([$roleModel->id]);
        }
    }

    public function delete(User $user): bool
    {
        return $user->delete();
    }

    public function getActive(): Collection
    {
        return User::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function search(string $query): Collection
    {
        return User::with('roles')
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('employee_id', 'like', "%{$query}%");
            })
            ->orderBy('name')
            ->limit(20)
            ->get();
    }
}
