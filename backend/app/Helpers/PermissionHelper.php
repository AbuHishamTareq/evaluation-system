<?php

namespace App\Helpers;

use App\Models\User;

class PermissionHelper
{
    /**
     * Check if a user has a specific permission through their roles.
     */
    public static function userHasPermission(User $user, string $permission): bool
    {
        return $user->roles()->whereHas('permissions', function ($query) use ($permission): void {
            $query->where('name', $permission);
        })->exists();
    }

    /**
     * Check if a user has any of the given permissions through their roles.
     */
    public static function userHasAnyPermission(User $user, array $permissions): bool
    {
        return $user->roles()->whereHas('permissions', function ($query) use ($permissions): void {
            $query->whereIn('name', $permissions);
        })->exists();
    }
}
