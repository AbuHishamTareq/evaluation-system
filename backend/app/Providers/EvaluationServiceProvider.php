<?php

namespace App\Providers;

use App\Features\Evaluations\Repositories\EloquentEvaluationRepository;
use App\Features\Evaluations\Repositories\EvaluationRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class EvaluationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            EvaluationRepositoryInterface::class,
            EloquentEvaluationRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
