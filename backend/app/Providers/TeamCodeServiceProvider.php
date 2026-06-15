<?php

namespace App\Providers;

use App\Features\TeamCodes\Repositories\EloquentTeamCodeRepository;
use App\Features\TeamCodes\Repositories\TeamCodeRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class TeamCodeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            TeamCodeRepositoryInterface::class,
            EloquentTeamCodeRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
