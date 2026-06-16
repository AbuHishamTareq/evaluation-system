<?php

namespace App\Providers;

use App\Features\QuestionSubCategories\Repositories\EloquentQuestionSubCategoryRepository;
use App\Features\QuestionSubCategories\Repositories\QuestionSubCategoryRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class QuestionSubCategoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            QuestionSubCategoryRepositoryInterface::class,
            EloquentQuestionSubCategoryRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
