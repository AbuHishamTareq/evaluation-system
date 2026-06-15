<?php

namespace App\Providers;

use App\Features\Questions\Repositories\EloquentQuestionRepository;
use App\Features\Questions\Repositories\QuestionRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class QuestionServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            QuestionRepositoryInterface::class,
            EloquentQuestionRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
