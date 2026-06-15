<?php

namespace App\Features\Auth\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthService
{
    public function register(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'employee_id' => $data['employee_id'] ?? null,
            'role' => $data['role'] ?? 'staff',
            'team_code_id' => $data['team_code_id'] ?? null,
        ]);

        // Assign pivot role based on the string role column
        $pivotRole = match ($data['role'] ?? 'staff') {
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

        return $user->fresh()->load('roles');
    }

    public function login(string $email, string $password, bool $rememberMe = false): ?array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        if (! $user->is_active) {
            throw new \RuntimeException('Your account has been deactivated');
        }

        $tokenExpiration = $rememberMe
            ? now()->addDays(30)
            : now()->addHours(config('sanctum.expiration') ?? 24);

        $token = $user->createToken('auth-token', ['*'], $tokenExpiration)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'remember_me' => $rememberMe,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw new \RuntimeException('Current password is incorrect');
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return true;
    }

    public function resetPassword(string $email): bool|array
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return false;
        }

        $status = Password::sendResetLink(
            ['email' => $email]
        );

        if ($status !== Password::RESET_LINK_SENT) {
            return false;
        }

        return true;
    }

    public function getAuthenticatedUser(): User
    {
        return Auth::user();
    }

    public function getUserTokens(User $user): array
    {
        return $user->tokens->map(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'created_at' => $token->created_at,
                'last_used_at' => $token->last_used_at,
            ];
        })->toArray();
    }

    public function revokeToken(User $user, int $tokenId): bool
    {
        $token = $user->tokens()->find($tokenId);

        if (! $token) {
            return false;
        }

        $token->delete();

        return true;
    }
}
