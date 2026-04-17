<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\Core\AuditLogController;
use App\Http\Controllers\API\V1\Core\ImportController;
use App\Http\Controllers\API\V1\Dashboard\DashboardController;
use App\Http\Controllers\API\V1\Dashboard\ExportController;
use App\Http\Controllers\API\V1\Evaluation\ActionPlanController;
use App\Http\Controllers\API\V1\Evaluation\EvaluationController;
use App\Http\Controllers\API\V1\Evaluation\EvaluationTemplateController;
use App\Http\Controllers\API\V1\HR\AlertController as HRAlertController;
use App\Http\Controllers\API\V1\HR\ShiftController;
use App\Http\Controllers\API\V1\HR\ShiftRequestController;
use App\Http\Controllers\API\V1\HR\StaffProfileController;
use App\Http\Controllers\API\V1\Issues\IssueController;
use App\Http\Controllers\API\V1\Pharmacy\MedicationAlertController;
use App\Http\Controllers\API\V1\Pharmacy\MedicationBatchController;
use App\Http\Controllers\API\V1\Pharmacy\MedicationController;
use App\Http\Controllers\API\V1\Pharmacy\MedicationLogController;
use App\Http\Controllers\API\V1\Safety\IncidentReportController;
use App\Http\Middleware\TenancyScope;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        Route::middleware(['throttle:60,1', TenancyScope::class])->group(function () {
            Route::apiResource('staff-profiles', StaffProfileController::class);
            Route::apiResource('shifts', ShiftController::class);
            Route::apiResource('shift-requests', ShiftRequestController::class)->except(['update']);

            Route::patch('shift-requests/{shift_request}/approve', [ShiftRequestController::class, 'approve']);
            Route::patch('shift-requests/{shift_request}/reject', [ShiftRequestController::class, 'reject']);

            Route::get('alerts/staff-shortages', [HRAlertController::class, 'staffShortages']);
            Route::get('alerts/department-coverage', [HRAlertController::class, 'departmentCoverage']);

            Route::get('incident-reports/dashboard', [IncidentReportController::class, 'dashboard']);
            Route::apiResource('incident-reports', IncidentReportController::class);

            Route::apiResource('medications', MedicationController::class);
            Route::apiResource('medication-batches', MedicationBatchController::class);
            Route::apiResource('medication-logs', MedicationLogController::class);

            Route::get('medication-alerts/dashboard', [MedicationAlertController::class, 'dashboard']);
            Route::get('medication-alerts', [MedicationAlertController::class, 'index']);
            Route::patch('medication-alerts/{medicationAlert}/resolve', [MedicationAlertController::class, 'resolve']);

            Route::get('evaluations/dashboard', [EvaluationController::class, 'dashboard']);
            Route::apiResource('evaluations', EvaluationController::class);
            Route::post('evaluations/{evaluation}/responses', [EvaluationController::class, 'submitResponse']);
            Route::post('evaluations/{evaluation}/complete', [EvaluationController::class, 'complete']);

            Route::apiResource('evaluation-templates', EvaluationTemplateController::class);
            Route::post('evaluation-templates/{evaluationTemplate}/questions', [EvaluationTemplateController::class, 'addQuestion']);
            Route::post('evaluation-templates/{evaluationTemplate}/import', [EvaluationTemplateController::class, 'importQuestions']);

            Route::apiResource('action-plans', ActionPlanController::class);
            Route::patch('action-plans/{actionPlan}/complete', [ActionPlanController::class, 'complete']);

            Route::get('issues/dashboard', [IssueController::class, 'dashboard']);
            Route::apiResource('issues', IssueController::class);
            Route::post('issues/{issue}/comments', [IssueController::class, 'addComment']);

            Route::get('audit-logs', [AuditLogController::class, 'index']);
            Route::get('audit-logs/history', [AuditLogController::class, 'history']);

            Route::post('import/process-csv', [ImportController::class, 'processCsv']);
            Route::post('import/validate', [ImportController::class, 'validate']);
            Route::post('import/data', [ImportController::class, 'import']);

            // Dashboard & Export Routes (Phase 3.3)
            Route::get('dashboard/kpi-summary', [DashboardController::class, 'kpiSummary']);
            Route::get('dashboard/drill-down', [DashboardController::class, 'drillDown']);
            Route::get('dashboard/comparative', [DashboardController::class, 'comparative']);
            Route::get('dashboard/trends', [DashboardController::class, 'trends']);

            Route::get('export/incidents', [ExportController::class, 'incidents']);
            Route::get('export/evaluations', [ExportController::class, 'evaluations']);
            Route::get('export/staff', [ExportController::class, 'staff']);
            Route::get('export/issues', [ExportController::class, 'issues']);
            Route::get('export', [ExportController::class, 'export']);
        });
    });
});
