<?php

namespace App\Providers;

use App\Features\Centers\Repositories\CenterRepositoryInterface;
use App\Features\Centers\Repositories\EloquentCenterRepository;
use Illuminate\Support\ServiceProvider;

class CenterServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            CenterRepositoryInterface::class,
            EloquentCenterRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
