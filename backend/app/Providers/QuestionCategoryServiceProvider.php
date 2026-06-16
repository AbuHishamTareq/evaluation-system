<?php

namespace App\Providers;

use App\Features\QuestionCategories\Repositories\EloquentQuestionCategoryRepository;
use App\Features\QuestionCategories\Repositories\QuestionCategoryRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class QuestionCategoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            QuestionCategoryRepositoryInterface::class,
            EloquentQuestionCategoryRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
