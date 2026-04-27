<?php

namespace App\Policies;

use App\Models\Region;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ZonePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('zones.view', 'web');
    }

    public function view(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('zones.view', 'web');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('zones.create', 'web');
    }

    public function update(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('zones.edit', 'web');
    }

    public function delete(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('zones.delete', 'web');
    }

    public function restore(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('zones.delete', 'web');
    }

    public function forceDelete(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('zones.delete', 'web');
    }
}
