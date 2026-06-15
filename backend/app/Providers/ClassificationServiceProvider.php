<?php

namespace App\Providers;

use App\Features\Classification\Repositories\CategoryRepositoryInterface;
use App\Features\Classification\Repositories\ClassificationMappingRepositoryInterface;
use App\Features\Classification\Repositories\EloquentCategoryRepository;
use App\Features\Classification\Repositories\EloquentClassificationMappingRepository;
use App\Features\Classification\Repositories\EloquentFieldRepository;
use App\Features\Classification\Repositories\EloquentRankRepository;
use App\Features\Classification\Repositories\EloquentSpecialtyRepository;
use App\Features\Classification\Repositories\FieldRepositoryInterface;
use App\Features\Classification\Repositories\RankRepositoryInterface;
use App\Features\Classification\Repositories\SpecialtyRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class ClassificationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(FieldRepositoryInterface::class, EloquentFieldRepository::class);
        $this->app->bind(SpecialtyRepositoryInterface::class, EloquentSpecialtyRepository::class);
        $this->app->bind(RankRepositoryInterface::class, EloquentRankRepository::class);
        $this->app->bind(CategoryRepositoryInterface::class, EloquentCategoryRepository::class);
        $this->app->bind(ClassificationMappingRepositoryInterface::class, EloquentClassificationMappingRepository::class);
    }

    public function boot(): void
    {
        //
    }
}
