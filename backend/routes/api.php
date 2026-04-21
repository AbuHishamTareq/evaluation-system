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
use App\Http\Controllers\API\V1\HR\DepartmentController;
use App\Http\Controllers\API\V1\HR\MedicalFieldController;
use App\Http\Controllers\API\V1\HR\NationalityController;
use App\Http\Controllers\API\V1\HR\PhcCenterController;
use App\Http\Controllers\API\V1\HR\RankController;
use App\Http\Controllers\API\V1\HR\RoleController;
use App\Http\Controllers\API\V1\HR\ShcCategoryController;
use App\Http\Controllers\API\V1\HR\ShiftController;
use App\Http\Controllers\API\V1\HR\ShiftRequestController;
use App\Http\Controllers\API\V1\HR\SpecialtyController;
use App\Http\Controllers\API\V1\HR\StaffProfileController;
use App\Http\Controllers\API\V1\HR\UserController;
use App\Http\Controllers\API\V1\HR\ZoneController;
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

        Route::middleware(['throttle:120,1', TenancyScope::class])->group(function () {
            Route::get('staff-profiles/export', [StaffProfileController::class, 'export']);
            Route::post('staff-profiles/import', [StaffProfileController::class, 'import']);
            Route::get('staff-profiles/template', [StaffProfileController::class, 'downloadTemplate']);
            Route::get('staff-profiles/next-id', [StaffProfileController::class, 'getNextEmployeeId']);
            Route::post('staff-profiles/bulk-update-status', [StaffProfileController::class, 'bulkUpdateStatus']);
            Route::patch('staff-profiles/{staffProfile}/toggle-status', [StaffProfileController::class, 'toggleStatus']);
            Route::apiResource('staff-profiles', StaffProfileController::class);
            Route::get('staff-profiles/{staffProfile}/educations', [StaffProfileController::class, 'educations']);
            Route::post('staff-profiles/{staffProfile}/educations', [StaffProfileController::class, 'storeEducation']);
            Route::put('staff-profiles/{staffProfile}/educations/{staffEducation}', [StaffProfileController::class, 'updateEducation']);
            Route::delete('staff-profiles/{staffProfile}/educations/{staffEducation}', [StaffProfileController::class, 'destroyEducation']);
            Route::get('staff-profiles/{staffProfile}/certificates', [StaffProfileController::class, 'certificates']);
            Route::post('staff-profiles/{staffProfile}/certificates', [StaffProfileController::class, 'storeCertificate']);
            Route::put('staff-profiles/{staffProfile}/certificates/{staffCertificate}', [StaffProfileController::class, 'updateCertificate']);
            Route::delete('staff-profiles/{staffProfile}/certificates/{staffCertificate}', [StaffProfileController::class, 'destroyCertificate']);
            Route::get('staff-profiles/{staffProfile}/experiences', [StaffProfileController::class, 'experiences']);
            Route::post('staff-profiles/{staffProfile}/experiences', [StaffProfileController::class, 'storeExperience']);
            Route::put('staff-profiles/{staffProfile}/experiences/{staffExperience}', [StaffProfileController::class, 'updateExperience']);
            Route::delete('staff-profiles/{staffProfile}/experiences/{staffExperience}', [StaffProfileController::class, 'destroyExperience']);
            Route::apiResource('shifts', ShiftController::class);
            Route::post('departments/import', [DepartmentController::class, 'import']);
            Route::get('departments/export', [DepartmentController::class, 'export']);
            Route::patch('departments/{department}/toggle-status', [DepartmentController::class, 'toggleStatus']);
            Route::apiResource('departments', DepartmentController::class);

            Route::post('zones/import', [ZoneController::class, 'import']);
            Route::get('zones/export', [ZoneController::class, 'export']);
            Route::patch('zones/{zone}/toggle-status', [ZoneController::class, 'toggleStatus']);
            Route::apiResource('zones', ZoneController::class);

            Route::post('phc-centers/import', [PhcCenterController::class, 'import']);
            Route::get('phc-centers/export', [PhcCenterController::class, 'export']);
            Route::patch('phc-centers/{phcCenter}/toggle-status', [PhcCenterController::class, 'toggleStatus']);
            Route::apiResource('phc-centers', PhcCenterController::class);

            Route::post('nationalities/import', [NationalityController::class, 'import']);
            Route::get('nationalities/export', [NationalityController::class, 'export']);
            Route::patch('nationalities/{nationality}/toggle-status', [NationalityController::class, 'toggleStatus']);
            Route::apiResource('nationalities', NationalityController::class);

            Route::get('roles/permissions', [RoleController::class, 'permissions']);
            Route::apiResource('roles', RoleController::class);

            Route::get('users/roles', [UserController::class, 'getAvailableRoles']);
            Route::post('users/{user}/assign-role', [UserController::class, 'assignRole']);
            Route::post('users/{user}/remove-role', [UserController::class, 'removeRole']);
            Route::post('users/{user}/sync-roles', [UserController::class, 'syncRoles']);
            Route::apiResource('users', UserController::class);

            Route::post('medical-fields/import', [MedicalFieldController::class, 'import']);
            Route::get('medical-fields/export', [MedicalFieldController::class, 'export']);
            Route::patch('medical-fields/{medicalField}/toggle-status', [MedicalFieldController::class, 'toggleStatus']);
            Route::apiResource('medical-fields', MedicalFieldController::class);

            Route::post('specialties/import', [SpecialtyController::class, 'import']);
            Route::get('specialties/export', [SpecialtyController::class, 'export']);
            Route::patch('specialties/{specialty}/toggle-status', [SpecialtyController::class, 'toggleStatus']);
            Route::apiResource('specialties', SpecialtyController::class);

            Route::post('ranks/import', [RankController::class, 'import']);
            Route::get('ranks/export', [RankController::class, 'export']);
            Route::patch('ranks/{rank}/toggle-status', [RankController::class, 'toggleStatus']);
            Route::apiResource('ranks', RankController::class);

            Route::post('shc-categories/import', [ShcCategoryController::class, 'import']);
            Route::get('shc-categories/export', [ShcCategoryController::class, 'export']);
            Route::patch('shc-categories/{shcCategory}/toggle-status', [ShcCategoryController::class, 'toggleStatus']);
            Route::apiResource('shc-categories', ShcCategoryController::class);

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
