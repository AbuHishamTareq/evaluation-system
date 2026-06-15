<?php

namespace App\Providers;

use App\Features\ClinicAssignments\Repositories\ClinicAssignmentRepositoryInterface;
use App\Features\ClinicAssignments\Repositories\EloquentClinicAssignmentRepository;
use Illuminate\Support\ServiceProvider;

class ClinicAssignmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            ClinicAssignmentRepositoryInterface::class,
            EloquentClinicAssignmentRepository::class
        );
    }
}
