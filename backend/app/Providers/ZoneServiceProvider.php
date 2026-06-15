<?php

namespace App\Providers;

use App\Features\Zones\Repositories\EloquentZoneRepository;
use App\Features\Zones\Repositories\ZoneRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class ZoneServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            ZoneRepositoryInterface::class,
            EloquentZoneRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
