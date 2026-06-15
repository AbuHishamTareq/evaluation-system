<?php

namespace App\Providers;

use App\Features\Staff\Repositories\EloquentStaffRepository;
use App\Features\Staff\Repositories\StaffRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class StaffServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            StaffRepositoryInterface::class,
            EloquentStaffRepository::class
        );
    }
}
