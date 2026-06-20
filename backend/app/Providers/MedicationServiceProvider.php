<?php

namespace App\Providers;

use App\Features\Medications\Repositories\EloquentMedicationRepository;
use App\Features\Medications\Repositories\EloquentPhcMedicationRepository;
use App\Features\Medications\Repositories\MedicationRepositoryInterface;
use App\Features\Medications\Repositories\PhcMedicationRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class MedicationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            MedicationRepositoryInterface::class,
            EloquentMedicationRepository::class
        );

        $this->app->bind(
            PhcMedicationRepositoryInterface::class,
            EloquentPhcMedicationRepository::class
        );
    }

    public function boot(): void
    {
        //
    }
}
