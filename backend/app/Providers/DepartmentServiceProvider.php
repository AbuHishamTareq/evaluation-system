<?php

namespace App\Providers;

use App\Features\Departments\Repositories\DepartmentRepositoryInterface;
use App\Features\Departments\Repositories\EloquentDepartmentRepository;
use Illuminate\Support\ServiceProvider;

class DepartmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            DepartmentRepositoryInterface::class,
            EloquentDepartmentRepository::class
        );
    }
}
