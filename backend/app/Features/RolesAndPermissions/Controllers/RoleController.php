<?php

namespace App\Features\RolesAndPermissions\Controllers;

use App\Features\RolesAndPermissions\Requests\AssignUserRolesRequest;
use App\Features\RolesAndPermissions\Requests\StoreRoleRequest;
use App\Features\RolesAndPermissions\Requests\SyncRolePermissionsRequest;
use App\Features\RolesAndPermissions\Requests\UpdateRoleRequest;
use App\Features\RolesAndPermissions\Services\RoleService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Roles & Permissions
 *
 * APIs for managing roles and their permission assignments.
 */
class RoleController extends BaseApiController
{
    public function __construct(
        protected RoleService $roleService
    ) {}

    /**
     * List all roles.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'sort_field', 'sort_direction']);
        $roles = $this->roleService->getAllRoles($filters);

        return $this->paginatedResponse($roles, 'Roles retrieved successfully');
    }

    /**
     * Create a new role.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->createRole($request->validated());

        return $this->successResponse($role, 'Role created successfully', 201);
    }

    /**
     * Get a single role.
     */
    public function show(int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);

        if (! $role) {
            return $this->errorResponse('Role not found', 404);
        }

        return $this->successResponse($role, 'Role retrieved successfully');
    }

    /**
     * Update a role.
     */
    public function update(UpdateRoleRequest $request, int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);

        if (! $role) {
            return $this->errorResponse('Role not found', 404);
        }

        $role = $this->roleService->updateRole($id, $request->validated());

        return $this->successResponse($role, 'Role updated successfully');
    }

    /**
     * Delete a role.
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->roleService->deleteRole($id);

        if (! $deleted) {
            return $this->errorResponse('Role not found', 404);
        }

        return $this->successResponse(null, 'Role deleted successfully');
    }

    /**
     * Get permissions assigned to a role.
     */
    public function getPermissions(int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);

        if (! $role) {
            return $this->errorResponse('Role not found', 404);
        }

        $permissions = $this->roleService->getRolePermissions($id);

        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }

    /**
     * Sync permissions to a role.
     */
    public function syncPermissions(SyncRolePermissionsRequest $request, int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);

        if (! $role) {
            return $this->errorResponse('Role not found', 404);
        }

        $this->roleService->syncRolePermissions($id, $request->validated()['permission_ids']);

        $role->load('permissions');

        return $this->successResponse($role, 'Permissions synced successfully');
    }

    /**
     * Get roles assigned to a user.
     */
    public function getUserRoles(int $userId): JsonResponse
    {
        $user = User::with('roles.permissions')->find($userId);

        if (! $user) {
            return $this->errorResponse('User not found', 404);
        }

        return $this->successResponse($user->roles, 'User roles retrieved successfully');
    }

    /**
     * Assign roles to a user.
     */
    public function assignUserRoles(AssignUserRolesRequest $request, int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (! $user) {
            return $this->errorResponse('User not found', 404);
        }

        $user->roles()->sync($request->validated()['role_ids']);
        $user->load('roles');

        return $this->successResponse($user, 'Roles assigned successfully');
    }

    /**
     * Get users assigned to a role.
     */
    public function getUsers(int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);

        if (! $role) {
            return $this->errorResponse('Role not found', 404);
        }

        $users = $this->roleService->getRoleUsers($id);

        return $this->successResponse($users, 'Users retrieved successfully');
    }

    /**
     * Sync users assigned to a role.
     */
    public function syncUsers(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        $role = $this->roleService->getRoleById($id);

        if (! $role) {
            return $this->errorResponse('Role not found', 404);
        }

        $this->roleService->syncRoleUsers($id, $validated['user_ids']);

        return $this->successResponse(null, 'Users synced successfully');
    }
}
