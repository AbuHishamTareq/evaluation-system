<?php

namespace App\Providers;

use App\Features\Professionals\Repositories\EloquentProfessionalRepository;
use App\Features\Professionals\Repositories\ProfessionalRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class ProfessionalServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            ProfessionalRepositoryInterface::class,
            EloquentProfessionalRepository::class
        );
    }
}
