<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => [
                'required',
                'string',
                'min:12',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/',
            ],
        ], [
            'password.min' => 'The password must be at least 12 characters.',
            'password.regex' => 'The password must contain uppercase, lowercase, number, and special character.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $user->load(['tenant', 'phcCenter', 'department', 'roles']);

        $permissions = \DB::table('permissions')
            ->join('role_has_permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
            ->join('model_has_roles', 'role_has_permissions.role_id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', 'App\\Models\\User')
            ->where('model_has_roles.model_id', $user->id)
            ->pluck('permissions.name')
            ->unique()
            ->values()
            ->toArray();

        $user->setAttribute('permissions', $permissions);

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['tenant', 'phcCenter', 'department', 'roles']);

        $permissions = \DB::table('permissions')
            ->join('role_has_permissions', 'permissions.id', '=', 'role_has_permissions.permission_id')
            ->join('model_has_roles', 'role_has_permissions.role_id', '=', 'model_has_roles.role_id')
            ->where('model_has_roles.model_type', 'App\\Models\\User')
            ->where('model_has_roles.model_id', $user->id)
            ->pluck('permissions.name')
            ->unique()
            ->values()
            ->toArray();

        $user->setAttribute('permissions', $permissions);

        return response()->json([
            'user' => $user,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'locale' => 'sometimes|in:en,ar',
        ]);

        $user = $request->user();
        $user->update($request->only(['name', 'locale']));

        return response()->json([
            'user' => $user->fresh()->load(['tenant', 'phcCenter', 'department', 'roles']),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => [
                'required',
                'string',
                'min:12',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/',
            ],
        ], [
            'new_password.min' => 'The password must be at least 12 characters.',
            'new_password.regex' => 'The password must contain uppercase, lowercase, number, and special character.',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        $user->update([
            'password' => $request->new_password,
        ]);

        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password changed successfully',
        ]);
    }
}
