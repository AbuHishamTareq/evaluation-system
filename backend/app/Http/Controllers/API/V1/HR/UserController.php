<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Traits\CachesIndex;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'users:';

    protected static int $cacheTtl = 30;

    public function index(Request $request): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $filters = $request->only(['search', 'is_active', 'per_page', 'page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = User::query()->with('roles');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            $perPage = $request->input('per_page', 15);
            $users = $query->orderByDesc('created_at')->paginate(min($perPage, 100));

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $users->items()),
                'meta' => [
                    'total' => $users->total(),
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.create', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role_id' => 'nullable|exists:roles,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        if (! empty($validated['role_id'])) {
            $role = Role::find($validated['role_id']);
            if ($role) {
                $user->assignRole($role);
            }
        }

        $this->clearIndexCache();

        return response()->json([
            'data' => $user->load('roles'),
            'message' => 'User created successfully',
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cacheKey = static::$cachePrefix.'show:'.$user->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($user) {
            $user->load(['roles', 'phcCenter', 'department']);

            return ['data' => $user->toArray()];
        });

        return response()->json($data);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,'.$user->id,
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$user->id);

        return response()->json([
            'data' => $user->load('roles'),
            'message' => 'User updated successfully',
        ]);
    }

    public function assignRole(Request $request, User $user): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $user->assignRole($role);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$user->id);

        return response()->json([
            'data' => $user->load('roles'),
            'message' => 'Role assigned successfully',
        ]);
    }

    public function removeRole(Request $request, User $user): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role_id' => 'required|exists:roles,id',
        ]);

        $role = Role::findOrFail($validated['role_id']);
        $user->removeRole($role);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$user->id);

        return response()->json([
            'data' => $user->load('roles'),
            'message' => 'Role removed successfully',
        ]);
    }

    public function syncRoles(Request $request, User $user): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.edit', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
        ]);

        $roles = Role::whereIn('id', $validated['role_ids'])->get();
        $user->syncRoles($roles);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$user->id);

        return response()->json([
            'data' => $user->load('roles'),
            'message' => 'Roles updated successfully',
        ]);
    }

    public function getAvailableRoles(): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.view', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cacheKey = static::$cachePrefix.'available-roles';

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () {
            $roles = Role::orderBy('name')->get();

            return ['data' => array_map(fn ($item) => $item->toArray(), $roles->all())];
        });

        return response()->json($data);
    }

    public function destroy(User $user): JsonResponse
    {
        if (! auth()->user() || ! auth()->user()->hasPermissionTo('users.delete', 'web')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$user->id);

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}
