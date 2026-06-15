<?php

namespace App\Features\Auth\Controllers;

use App\Features\Auth\Services\AuthService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends BaseApiController
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Register a new user.
     *
     * Creates a new user account with the provided details and returns an authentication token.
     *
     * @group Authentication
     *
     * @unauthenticated
     *
     * @bodyParam name string required The full name of the user. Example: John Doe
     * @bodyParam email string required The email address of the user. Example: john@example.com
     * @bodyParam password string required The password (minimum 8 characters). Example: securePass123
     * @bodyParam role string optional The role assigned to the user. Must be one of: admin, manager, evaluator, staff. Example: evaluator
     * @bodyParam employee_id string optional The employee ID for the user. Example: EMP-001
     *
     * @response {
     *   "success": true,
     *   "message": "User registered successfully",
     *   "data": {
     *     "user": {
     *       "id": "uuid",
     *       "name": "John Doe",
     *       "email": "john@example.com",
     *       "employee_id": "EMP-001",
     *       "created_at": "2026-06-15T00:00:00.000000Z"
     *     },
     *     "token": "1|abc123def456..."
     *   }
     * }
     * @response status=422 {
     *   "success": false,
     *   "message": "The email field is required. (and 2 more errors)",
     *   "errors": {
     *     "email": ["The email field is required."],
     *     "password": ["The password field is required."]
     *   }
     * }
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|string|in:admin,manager,evaluator,staff',
            'employee_id' => 'nullable|string|max:255',
        ]);

        $user = $this->authService->register($validated);

        return $this->successResponse($user, 'User registered successfully', 201);
    }

    /**
     * Log in an existing user.
     *
     * Authenticates a user with their email and password, returning a Sanctum token.
     *
     * @group Authentication
     *
     * @unauthenticated
     *
     * @bodyParam email string required The registered email address. Example: john@example.com
     * @bodyParam password string required The user's password. Example: securePass123
     * @bodyParam remember_me boolean optional Whether to create a long-lived token. Example: true
     *
     * @response {
     *   "success": true,
     *   "message": "Login successful",
     *   "data": {
     *     "user": {
     *       "id": "uuid",
     *       "name": "John Doe",
     *       "email": "john@example.com"
     *     },
     *     "token": "1|abc123def456..."
     *   }
     * }
     * @response status=401 {
     *   "success": false,
     *   "message": "Invalid credentials"
     * }
     * @response status=403 {
     *   "success": false,
     *   "message": "Account is deactivated"
     * }
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'sometimes|boolean',
        ]);

        try {
            $result = $this->authService->login(
                $validated['email'],
                $validated['password'],
                $validated['remember_me'] ?? false
            );

            if (! $result) {
                return $this->errorResponse('Invalid credentials', 401);
            }

            return $this->successResponse(
                $result,
                'Login successful'
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        }
    }

    /**
     * Log out the current user.
     *
     * Revokes the current access token and logs the user out.
     *
     * @group Authentication
     *
     * @authenticated
     *
     * @response {
     *   "success": true,
     *   "message": "Logged out successfully",
     *   "data": null
     * }
     */
    public function logout(): JsonResponse
    {
        $user = Auth::user();
        $this->authService->logout($user);

        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * Get authenticated user profile.
     *
     * Returns the currently authenticated user's profile information including roles and permissions.
     *
     * @group Authentication
     *
     * @authenticated
     *
     * @response {
     *   "success": true,
     *   "message": "User retrieved successfully",
     *   "data": {
     *     "id": "uuid",
     *     "name": "John Doe",
     *     "email": "john@example.com",
     *     "employee_id": "EMP-001",
     *     "roles": ["evaluator"],
     *     "permissions": ["evaluations.view", "evaluations.create"],
     *     "created_at": "2026-06-15T00:00:00.000000Z"
     *   }
     * }
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->getAuthenticatedUser();

        return $this->successResponse($user, 'User retrieved successfully');
    }

    /**
     * Change the current user's password.
     *
     * @group Authentication
     *
     * @authenticated
     *
     * @bodyParam current_password string required The current password. Example: oldPass123
     * @bodyParam new_password string required The new password (minimum 8 characters). Example: newSecurePass456
     *
     * @response {
     *   "success": true,
     *   "message": "Password changed successfully",
     *   "data": null
     * }
     * @response status=400 {
     *   "success": false,
     *   "message": "Current password is incorrect"
     * }
     */
    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8',
        ]);

        $user = Auth::user();

        try {
            $this->authService->changePassword(
                $user,
                $validated['current_password'],
                $validated['new_password']
            );

            return $this->successResponse(null, 'Password changed successfully');
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Request a password reset link.
     *
     * Sends a password reset link to the specified email address if it exists in the system.
     *
     * @group Authentication
     *
     * @unauthenticated
     *
     * @bodyParam email string required The registered email address. Example: john@example.com
     *
     * @response {
     *   "success": true,
     *   "message": "Password reset link sent to email",
     *   "data": null
     * }
     * @response status=404 {
     *   "success": false,
     *   "message": "Email not found"
     * }
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
        ]);

        $reset = $this->authService->resetPassword($validated['email']);

        if (! $reset) {
            return $this->errorResponse('Email not found', 404);
        }

        return $this->successResponse(null, 'Password reset link sent to email');
    }

    /**
     * List all active API tokens.
     *
     * Returns all active Sanctum tokens for the authenticated user.
     *
     * @group Authentication
     *
     * @authenticated
     *
     * @response {
     *   "success": true,
     *   "message": "Tokens retrieved successfully",
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "API Token",
     *       "last_used_at": "2026-06-15T12:00:00.000000Z",
     *       "created_at": "2026-06-14T00:00:00.000000Z"
     *     }
     *   ]
     * }
     */
    public function tokens(): JsonResponse
    {
        $user = Auth::user();
        $tokens = $this->authService->getUserTokens($user);

        return $this->successResponse($tokens, 'Tokens retrieved successfully');
    }

    /**
     * Revoke an API token.
     *
     * Deletes a specific Sanctum token by its ID.
     *
     * @group Authentication
     *
     * @authenticated
     *
     * @urlParam tokenId integer required The ID of the token to revoke. Example: 1
     *
     * @response {
     *   "success": true,
     *   "message": "Token revoked successfully",
     *   "data": null
     * }
     * @response status=404 {
     *   "success": false,
     *   "message": "Token not found"
     * }
     */
    public function revokeToken(Request $request, int $tokenId): JsonResponse
    {
        $user = Auth::user();
        $revoked = $this->authService->revokeToken($user, $tokenId);

        if (! $revoked) {
            return $this->errorResponse('Token not found', 404);
        }

        return $this->successResponse(null, 'Token revoked successfully');
    }

    /**
     * Get current user permissions.
     *
     * Returns a flat list of all permission names assigned to the authenticated user via their roles.
     *
     * @group Authentication
     *
     * @authenticated
     *
     * @response {
     *   "success": true,
     *   "message": "Permissions retrieved successfully",
     *   "data": ["evaluations.view", "evaluations.create", "staff.view"]
     * }
     */
    public function permissions(): JsonResponse
    {
        $user = Auth::user();

        if (! $user) {
            return $this->errorResponse('Unauthenticated', 401);
        }

        $permissions = $user->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique()
            ->values()
            ->toArray();

        return $this->successResponse($permissions, 'Permissions retrieved successfully');
    }
}
