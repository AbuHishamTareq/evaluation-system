<?php

namespace App\Providers;

use App\Features\MedicationEvaluations\Repositories\EloquentMedicationEvaluationRepository;
use App\Features\MedicationEvaluations\Repositories\EloquentMedicationEvaluationTemplateRepository;
use App\Features\MedicationEvaluations\Repositories\MedicationEvaluationRepositoryInterface;
use App\Features\MedicationEvaluations\Repositories\MedicationEvaluationTemplateRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class MedicationEvaluationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            MedicationEvaluationTemplateRepositoryInterface::class,
            EloquentMedicationEvaluationTemplateRepository::class
        );

        $this->app->bind(
            MedicationEvaluationRepositoryInterface::class,
            EloquentMedicationEvaluationRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
