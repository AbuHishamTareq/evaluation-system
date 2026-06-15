<?php

namespace App\Providers;

use App\Features\RolesAndPermissions\Repositories\EloquentPermissionRepository;
use App\Features\RolesAndPermissions\Repositories\EloquentRoleRepository;
use App\Features\RolesAndPermissions\Repositories\PermissionRepositoryInterface;
use App\Features\RolesAndPermissions\Repositories\RoleRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RolesAndPermissionsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            RoleRepositoryInterface::class,
            EloquentRoleRepository::class
        );

        $this->app->bind(
            PermissionRepositoryInterface::class,
            EloquentPermissionRepository::class
        );
    }
}
