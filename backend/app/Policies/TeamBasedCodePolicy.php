<?php

namespace App\Policies;

use App\Models\TeamBasedCode;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamBasedCodePolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('team_based_codes.view', 'web');
    }

    public function view(User $user, TeamBasedCode $teamBasedCode): bool
    {
        return $user->hasPermissionTo('team_based_codes.view', 'web');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('team_based_codes.create', 'web');
    }

    public function update(User $user, TeamBasedCode $teamBasedCode): bool
    {
        return $user->hasPermissionTo('team_based_codes.edit', 'web');
    }

    public function delete(User $user, TeamBasedCode $teamBasedCode): bool
    {
        return $user->hasPermissionTo('team_based_codes.delete', 'web');
    }

    public function restore(User $user, TeamBasedCode $teamBasedCode): bool
    {
        return $user->hasPermissionTo('team_based_codes.delete', 'web');
    }

    public function forceDelete(User $user, TeamBasedCode $teamBasedCode): bool
    {
        return $user->hasPermissionTo('team_based_codes.delete', 'web');
    }
}
