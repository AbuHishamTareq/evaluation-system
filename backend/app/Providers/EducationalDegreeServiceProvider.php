<?php

namespace App\Providers;

use App\Features\EducationalDegrees\Repositories\EducationalDegreeRepositoryInterface;
use App\Features\EducationalDegrees\Repositories\EloquentEducationalDegreeRepository;
use Illuminate\Support\ServiceProvider;

class EducationalDegreeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            EducationalDegreeRepositoryInterface::class,
            EloquentEducationalDegreeRepository::class
        );
    }
}
