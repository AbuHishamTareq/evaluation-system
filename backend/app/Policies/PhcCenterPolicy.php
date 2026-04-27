<?php

namespace App\Policies;

use App\Models\PhcCenter;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PhcCenterPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('phc_centers.view', 'web');
    }

    public function view(User $user, PhcCenter $phcCenter): bool
    {
        return $user->hasPermissionTo('phc_centers.view', 'web');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('phc_centers.create', 'web');
    }

    public function update(User $user, PhcCenter $phcCenter): bool
    {
        return $user->hasPermissionTo('phc_centers.edit', 'web');
    }

    public function delete(User $user, PhcCenter $phcCenter): bool
    {
        return $user->hasPermissionTo('phc_centers.delete', 'web');
    }

    public function restore(User $user, PhcCenter $phcCenter): bool
    {
        return $user->hasPermissionTo('phc_centers.delete', 'web');
    }

    public function forceDelete(User $user, PhcCenter $phcCenter): bool
    {
        return $user->hasPermissionTo('phc_centers.delete', 'web');
    }
}
