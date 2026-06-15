<?php

namespace App\Features\RolesAndPermissions\Controllers;

use App\Features\RolesAndPermissions\Services\PermissionService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Roles & Permissions
 *
 * APIs for managing individual permissions.
 */
class PermissionController extends BaseApiController
{
    public function __construct(
        protected PermissionService $permissionService
    ) {}

    /**
     * List all permissions.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'sort_field', 'sort_direction']);
        $permissions = $this->permissionService->getAllPermissions($filters);

        return $this->paginatedResponse($permissions, 'Permissions retrieved successfully');
    }

    /**
     * Create a new permission.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:permissions,name'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $permission = $this->permissionService->createPermission($validated);

        return $this->successResponse($permission, 'Permission created successfully', 201);
    }

    /**
     * Get a single permission.
     */
    public function show(int $id): JsonResponse
    {
        $permission = $this->permissionService->getPermissionById($id);

        if (! $permission) {
            return $this->errorResponse('Permission not found', 404);
        }

        return $this->successResponse($permission, 'Permission retrieved successfully');
    }

    /**
     * Update a permission.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $permission = $this->permissionService->getPermissionById($id);

        if (! $permission) {
            return $this->errorResponse('Permission not found', 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', "unique:permissions,name,{$id}"],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        $permission = $this->permissionService->updatePermission($id, $validated);

        return $this->successResponse($permission, 'Permission updated successfully');
    }

    /**
     * Delete a permission.
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->permissionService->deletePermission($id);

        if (! $deleted) {
            return $this->errorResponse('Permission not found', 404);
        }

        return $this->successResponse(null, 'Permission deleted successfully');
    }
}
