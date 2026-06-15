<?php

namespace App\Providers;

use App\Features\Users\Repositories\EloquentUserRepository;
use App\Features\Users\Repositories\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class UserServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            UserRepositoryInterface::class,
            EloquentUserRepository::class
        );
    }
}
