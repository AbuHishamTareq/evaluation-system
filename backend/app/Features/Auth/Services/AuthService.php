<?php

namespace App\Features\Auth\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthService
{
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

        // Revoke all tokens except the current one
        $user->tokens()
            ->when($user->currentAccessToken(), fn ($q) => $q->where('id', '!=', $user->currentAccessToken()->id))
            ->delete();

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
