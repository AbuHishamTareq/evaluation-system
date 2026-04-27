<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Traits\CachesIndex;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'roles:';

    protected static int $cacheTtl = 30;

    public function index(Request $request): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('roles.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $filters = $request->only(['search', 'per_page', 'page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = Role::query()->with('permissions');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where('name', 'like', "%{$search}%");
            }

            $perPage = $request->input('per_page', 15);
            $roles = $query->orderByDesc('created_at')->paginate(min($perPage, 100));

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $roles->items()),
                'meta' => [
                    'total' => $roles->total(),
                    'current_page' => $roles->currentPage(),
                    'last_page' => $roles->lastPage(),
                    'per_page' => $roles->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('roles.create', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (! empty($validated['permissions'])) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->get();
            $role->syncPermissions($permissions);
        }

        $this->clearIndexCache();

        return response()->json([
            'data' => $role->load('permissions'),
            'message' => 'Role created successfully',
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('roles.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cacheKey = static::$cachePrefix.'show:'.$role->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($role) {
            $role->load('permissions');

            return ['data' => $role->toArray()];
        });

        return response()->json($data);
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('roles.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:roles,name,'.$role->id,
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        $role->update([
            'name' => $validated['name'] ?? $role->name,
            'description' => $validated['description'] ?? $role->description,
        ]);

        if ($request->has('permissions')) {
            $permissions = Permission::whereIn('id', $validated['permissions'])->get();
            $role->syncPermissions($permissions);
        }

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$role->id);

        return response()->json([
            'data' => $role->load('permissions'),
            'message' => 'Role updated successfully',
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('roles.delete', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($role->name === 'Main Office') {
            return response()->json([
                'error' => 'Cannot delete the Main Office role',
            ], 422);
        }

        $role->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$role->id);

        return response()->json([
            'message' => 'Role deleted successfully',
        ]);
    }

    public function permissions(): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('roles.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cacheKey = static::$cachePrefix.'permissions';

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () {
            $permissions = Permission::whereNotNull('id')
                ->whereNot(function ($query) {
                    $query->where('name', 'like', '%.import')
                        ->orWhere('name', 'like', '%.export');
                })
                ->orderBy('name')
                ->get();

            $grouped = $permissions->groupBy(function ($permission) {
                $parts = explode('.', $permission->name);

                return $parts[0] ?? 'other';
            });

            $sorted = $grouped->sortKeys();

            return ['data' => $sorted->toArray()];
        });

        return response()->json($data);
    }
}
