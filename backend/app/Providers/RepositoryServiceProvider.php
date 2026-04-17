<?php

namespace App\Providers;

use App\Repositories\EloquentIncidentReportRepository;
use App\Repositories\EloquentShiftRepository;
use App\Repositories\EloquentStaffProfileRepository;
use App\Repositories\Interfaces\IncidentReportRepositoryInterface;
use App\Repositories\Interfaces\ShiftRepositoryInterface;
use App\Repositories\Interfaces\StaffProfileRepositoryInterface;
use App\Services\Core\AuditService;
use App\Services\Core\ImportService;
use App\Services\Dashboard\DashboardService;
use App\Services\Dashboard\ExportService;
use App\Services\Evaluation\EvaluationService;
use App\Services\HR\IncidentReportService;
use App\Services\HR\ShiftService;
use App\Services\HR\StaffProfileService;
use App\Services\Issues\IssueService;
use App\Services\Pharmacy\MedicationService;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(StaffProfileRepositoryInterface::class, EloquentStaffProfileRepository::class);
        $this->app->singleton(ShiftRepositoryInterface::class, EloquentShiftRepository::class);
        $this->app->singleton(IncidentReportRepositoryInterface::class, EloquentIncidentReportRepository::class);

        $this->app->singleton(StaffProfileService::class, function ($app) {
            return new StaffProfileService($app->make(StaffProfileRepositoryInterface::class));
        });

        $this->app->singleton(ShiftService::class, function ($app) {
            return new ShiftService($app->make(ShiftRepositoryInterface::class));
        });

        $this->app->singleton(IncidentReportService::class, function ($app) {
            return new IncidentReportService($app->make(IncidentReportRepositoryInterface::class));
        });

        $this->app->singleton(MedicationService::class);
        $this->app->singleton(EvaluationService::class);
        $this->app->singleton(IssueService::class);
        $this->app->singleton(AuditService::class);
        $this->app->singleton(ImportService::class);
        $this->app->singleton(DashboardService::class);
        $this->app->singleton(ExportService::class);
    }

    public function boot(): void
    {
        //
    }
}
