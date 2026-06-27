<?php

use App\Features\ActionPlans\Controllers\ActionPlanController;
use App\Features\Analytics\Controllers\AnalyticsController;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Centers\Controllers\CenterController;
use App\Features\Classification\Controllers\CategoryController;
use App\Features\Classification\Controllers\ClassificationController;
use App\Features\Classification\Controllers\FieldController;
use App\Features\Classification\Controllers\RankController;
use App\Features\Classification\Controllers\SpecialtyController;
use App\Features\ClinicAssignments\Controllers\ClinicAssignmentController;
use App\Features\Departments\Controllers\DepartmentController;
use App\Features\EducationalDegrees\Controllers\EducationalDegreeController;
use App\Features\Evaluations\Controllers\EvaluationController;
use App\Features\Evaluations\Controllers\TemplateController;
use App\Features\MedicationEvaluations\Controllers\MedicationEvaluationController;
use App\Features\MedicationEvaluations\Controllers\MedicationEvaluationTemplateController;
use App\Features\Medications\Controllers\MedicationController;
use App\Features\Medications\Controllers\PhcMedicationController;
use App\Features\Professionals\Controllers\ProfessionalController;
use App\Features\QuestionCategories\Controllers\QuestionCategoryController;
use App\Features\Questions\Controllers\QuestionController;
use App\Features\QuestionSubCategories\Controllers\QuestionSubCategoryController;
use App\Features\RolesAndPermissions\Controllers\PermissionController;
use App\Features\RolesAndPermissions\Controllers\RoleController;
use App\Features\Staff\Controllers\StaffController;
use App\Features\TeamCodes\Controllers\TeamCodeController;
use App\Features\Users\Controllers\UserController;
use App\Features\Zones\Controllers\ZoneController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider within the "api" group.
|
*/

Route::prefix('v1')->group(function () {
    // Public routes - Authentication
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::prefix('auth')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
            Route::get('/tokens', [AuthController::class, 'tokens']);
            Route::delete('/tokens/{tokenId}', [AuthController::class, 'revokeToken']);
        });

        // Auth - current user permissions
        Route::prefix('auth')->group(function () {
            Route::get('/permissions', [AuthController::class, 'permissions']);
        });

        // Staff
        Route::prefix('staff')->group(function () {
            Route::get('/', [StaffController::class, 'index'])->middleware('permission:staff.view');
            Route::post('/', [StaffController::class, 'store'])->middleware('permission:staff.create');
            Route::post('/import', [StaffController::class, 'import'])->middleware('permission:staff.create');
            Route::get('/export', [StaffController::class, 'export'])->middleware('permission:staff.view');
            Route::get('/sample', [StaffController::class, 'sample']);
            Route::get('/statistics', [StaffController::class, 'statistics']);
            Route::get('/search', [StaffController::class, 'search']);
            Route::get('/center/{centerId}', [StaffController::class, 'byCenter'])->middleware('permission:centers.view_staff');
            Route::get('/team-code/{teamCode}', [StaffController::class, 'byTeamCode'])->middleware('permission:staff.view');
            Route::patch('/{id}/toggle-active', [StaffController::class, 'toggleActive'])->middleware('permission:staff.activate');
            Route::get('{staff}/cv', [StaffController::class, 'exportCv'])->name('staff.cv')->middleware('permission:staff.view');
            Route::get('{staff}/deactivations', [StaffController::class, 'deactivations'])->middleware('permission:staff.view_history');
            Route::get('/{id}', [StaffController::class, 'show'])->middleware('permission:staff.view');
            Route::put('/{id}', [StaffController::class, 'update'])->middleware('permission:staff.edit');
            Route::delete('/{id}', [StaffController::class, 'destroy'])->middleware('permission:staff.delete');
            Route::post('/{id}/upload-photo', [StaffController::class, 'uploadPhoto'])->middleware('permission:staff.edit');
            Route::post('/{id}/upload-documents', [StaffController::class, 'uploadDocuments'])->middleware('permission:staff.edit');
            Route::delete('/{id}/documents/{documentId}', [StaffController::class, 'deleteDocument'])->middleware('permission:staff.edit');
        });

        // Question Categories
        Route::prefix('question-categories')->group(function () {
            Route::get('/', [QuestionCategoryController::class, 'index'])->middleware('permission:question-categories.view');
            Route::post('/', [QuestionCategoryController::class, 'store'])->middleware('permission:question-categories.create');
            Route::get('/active', [QuestionCategoryController::class, 'active'])->middleware('permission:question-categories.view');
            Route::get('/sample', [QuestionCategoryController::class, 'downloadSample']);
            Route::get('/export/{format?}', [QuestionCategoryController::class, 'export'])->middleware('permission:question-categories.view');
            Route::post('/import', [QuestionCategoryController::class, 'import'])->middleware('permission:question-categories.create');
            Route::get('/{id}', [QuestionCategoryController::class, 'show'])->middleware('permission:question-categories.view');
            Route::put('/{id}', [QuestionCategoryController::class, 'update'])->middleware('permission:question-categories.edit');
            Route::patch('/{id}/toggle-status', [QuestionCategoryController::class, 'toggleStatus'])->middleware('permission:question-categories.edit');
            Route::delete('/{id}', [QuestionCategoryController::class, 'destroy'])->middleware('permission:question-categories.delete');
        });

        // Question Sub-Categories
        Route::prefix('question-sub-categories')->group(function () {
            Route::get('/', [QuestionSubCategoryController::class, 'index'])->middleware('permission:question-sub-categories.view');
            Route::post('/', [QuestionSubCategoryController::class, 'store'])->middleware('permission:question-sub-categories.create');
            Route::get('/active', [QuestionSubCategoryController::class, 'active'])->middleware('permission:question-sub-categories.view');
            Route::get('/sample', [QuestionSubCategoryController::class, 'downloadSample'])->middleware('permission:question-sub-categories.view');
            Route::get('/export/{format?}', [QuestionSubCategoryController::class, 'export'])->middleware('permission:question-sub-categories.view');
            Route::post('/import', [QuestionSubCategoryController::class, 'import'])->middleware('permission:question-sub-categories.create');
            Route::get('/{id}', [QuestionSubCategoryController::class, 'show'])->middleware('permission:question-sub-categories.view');
            Route::put('/{id}', [QuestionSubCategoryController::class, 'update'])->middleware('permission:question-sub-categories.edit');
            Route::patch('/{id}/toggle-status', [QuestionSubCategoryController::class, 'toggleStatus'])->middleware('permission:question-sub-categories.edit');
            Route::delete('/{id}', [QuestionSubCategoryController::class, 'destroy'])->middleware('permission:question-sub-categories.delete');
        });

        // Questions
        Route::prefix('questions')->group(function () {
            Route::get('/', [QuestionController::class, 'index'])->middleware('permission:questions.view');
            Route::post('/', [QuestionController::class, 'store'])->middleware('permission:questions.create');
            Route::get('/sample', [QuestionController::class, 'sample'])->middleware('permission:questions.create');
            Route::post('/import', [QuestionController::class, 'import'])->middleware('permission:questions.create');
            Route::get('/export/{format?}', [QuestionController::class, 'export'])->middleware('permission:questions.view');
            Route::get('/categories', [QuestionController::class, 'categories'])->middleware('permission:questions.view');
            Route::post('/categories', [QuestionController::class, 'storeCategory'])->middleware('permission:questions.create');
            Route::put('/categories/{id}', [QuestionController::class, 'updateCategory'])->middleware('permission:questions.edit');
            Route::delete('/categories/{id}', [QuestionController::class, 'destroyCategory'])->middleware('permission:questions.delete');
            Route::get('/category/{categoryId}', [QuestionController::class, 'byCategory'])->middleware('permission:questions.view');
            Route::get('/type', [QuestionController::class, 'byType'])->middleware('permission:questions.view');
            Route::get('/{id}', [QuestionController::class, 'show'])->middleware('permission:questions.view');
            Route::put('/{id}', [QuestionController::class, 'update'])->middleware('permission:questions.edit');
            Route::delete('/{id}', [QuestionController::class, 'destroy'])->middleware('permission:questions.delete');
        });

        // Evaluations
        Route::prefix('evaluations')->group(function () {
            Route::get('/', [EvaluationController::class, 'index'])->middleware('permission:evaluations.view');
            Route::post('/', [EvaluationController::class, 'store'])->middleware('permission:evaluations.create');
            Route::get('/staff/{staffId}', [EvaluationController::class, 'byStaff'])->middleware('permission:evaluations.view');
            Route::get('/period', [EvaluationController::class, 'byPeriod'])->middleware('permission:evaluations.view');
            Route::post('/{id}/submit', [EvaluationController::class, 'submit'])->middleware('permission:evaluations.submit');
            Route::post('/{id}/approve', [EvaluationController::class, 'approve'])->middleware('permission:evaluations.approve');
            Route::get('/{id}', [EvaluationController::class, 'show'])->middleware('permission:evaluations.view');
            Route::put('/{id}', [EvaluationController::class, 'update'])->middleware('permission:evaluations.edit');
            Route::delete('/{id}', [EvaluationController::class, 'destroy'])->middleware('permission:evaluations.delete');
        });

        // Templates
        Route::prefix('templates')->group(function () {
            Route::get('/', [TemplateController::class, 'index'])->middleware('permission:templates.view');
            Route::post('/', [TemplateController::class, 'store'])->middleware('permission:templates.create');
            Route::get('/active', [TemplateController::class, 'active'])->middleware('permission:templates.view');
            Route::get('/{id}', [TemplateController::class, 'show'])->middleware('permission:templates.view');
            Route::put('/{id}', [TemplateController::class, 'update'])->middleware('permission:templates.edit');
            Route::patch('/{id}/toggle-status', [TemplateController::class, 'toggleStatus'])->middleware('permission:templates.toggle');
            Route::delete('/{id}', [TemplateController::class, 'destroy'])->middleware('permission:templates.delete');
        });

        // Centers
        Route::prefix('centers')->group(function () {
            Route::get('/', [CenterController::class, 'index'])->middleware('permission:centers.view');
            Route::post('/', [CenterController::class, 'store'])->middleware('permission:centers.create');
            Route::post('/import', [CenterController::class, 'import'])->middleware('permission:centers.create');
            Route::get('/export', [CenterController::class, 'export'])->middleware('permission:centers.view');
            Route::get('/active', [CenterController::class, 'active'])->middleware('permission:centers.view');
            Route::get('/search', [CenterController::class, 'search'])->middleware('permission:centers.view');
            Route::get('/{id}/statistics', [CenterController::class, 'statistics'])->middleware('permission:centers.view');
            Route::get('/{id}', [CenterController::class, 'show'])->middleware('permission:centers.view');
            Route::put('/{id}', [CenterController::class, 'update'])->middleware('permission:centers.edit');
            Route::patch('/{id}/status', [CenterController::class, 'updateStatus'])->middleware('permission:centers.activate');
            Route::delete('/{id}', [CenterController::class, 'destroy'])->middleware('permission:centers.delete');
        });

        // Action Plans
        Route::prefix('action-plans')->group(function () {
            Route::get('/', [ActionPlanController::class, 'index']);
            Route::post('/', [ActionPlanController::class, 'store']);
            Route::get('/evaluation/{evaluationId}', [ActionPlanController::class, 'byEvaluation']);
            Route::get('/staff/{staffId}', [ActionPlanController::class, 'byStaff']);
            Route::get('/staff/{staffId}/summary', [ActionPlanController::class, 'summary']);
            Route::patch('/{id}/status', [ActionPlanController::class, 'updateStatus']);
            Route::get('/{id}', [ActionPlanController::class, 'show']);
            Route::put('/{id}', [ActionPlanController::class, 'update']);
            Route::delete('/{id}', [ActionPlanController::class, 'destroy']);
        });

        // Team Codes
        Route::prefix('team-codes')->group(function () {
            Route::get('/', [TeamCodeController::class, 'index'])->middleware('permission:team-codes.view');
            Route::post('/', [TeamCodeController::class, 'store'])->middleware('permission:team-codes.create');
            Route::post('/import', [TeamCodeController::class, 'import'])->middleware('permission:team-codes.create');
            Route::get('/export', [TeamCodeController::class, 'export'])->middleware('permission:team-codes.view');
            Route::get('/sample', [TeamCodeController::class, 'downloadSample']);
            Route::get('/active', [TeamCodeController::class, 'active'])->middleware('permission:team-codes.view');
            Route::get('/search', [TeamCodeController::class, 'search'])->middleware('permission:team-codes.view');
            Route::get('/{id}/statistics', [TeamCodeController::class, 'statistics'])->middleware('permission:team-codes.view');
            Route::get('/{id}', [TeamCodeController::class, 'show'])->middleware('permission:team-codes.view');
            Route::put('/{id}', [TeamCodeController::class, 'update'])->middleware('permission:team-codes.edit');
            Route::patch('/{id}/toggle-status', [TeamCodeController::class, 'toggleStatus'])->middleware('permission:team-codes.edit');
            Route::delete('/{id}', [TeamCodeController::class, 'destroy'])->middleware('permission:team-codes.delete');
        });

        // Analytics
        Route::prefix('analytics')->group(function () {
            Route::get('/dashboard', [AnalyticsController::class, 'dashboard'])->middleware('permission:reports.view');
            Route::get('/evaluation-trends', [AnalyticsController::class, 'evaluationTrends'])->middleware('permission:reports.view');
            Route::get('/top-performers', [AnalyticsController::class, 'topPerformers'])->middleware('permission:reports.view');
            Route::get('/center-performance', [AnalyticsController::class, 'centerPerformance'])->middleware('permission:reports.view');
            Route::get('/question-analytics', [AnalyticsController::class, 'questionAnalytics'])->middleware('permission:reports.view');
            Route::get('/action-plan-statistics', [AnalyticsController::class, 'actionPlanStatistics'])->middleware('permission:reports.view');
            Route::get('/score-distribution', [AnalyticsController::class, 'scoreDistribution'])->middleware('permission:reports.view');
            Route::get('/zone-analytics', [AnalyticsController::class, 'zoneAnalytics'])->middleware('permission:reports.view');
            Route::get('/classification-breakdown', [AnalyticsController::class, 'classificationBreakdown'])->middleware('permission:reports.view');
            Route::get('/recent-activity', [AnalyticsController::class, 'recentActivity'])->middleware('permission:reports.view');
            Route::get('/composite-score', [AnalyticsController::class, 'compositeScore'])->middleware('permission:reports.view');
            Route::get('/export/pdf', [AnalyticsController::class, 'exportPdf'])->middleware('permission:reports.export');
            Route::get('/export/excel', [AnalyticsController::class, 'exportExcel'])->middleware('permission:reports.export');
        });

        // Zones
        Route::prefix('zones')->group(function () {
            Route::get('/', [ZoneController::class, 'index'])->middleware('permission:zones.view');
            Route::post('/', [ZoneController::class, 'store'])->middleware('permission:zones.create');
            Route::post('/import', [ZoneController::class, 'import'])->middleware('permission:zones.create');
            Route::get('/export', [ZoneController::class, 'export'])->middleware('permission:zones.view');
            Route::get('/tree', [ZoneController::class, 'tree'])->middleware('permission:zones.view');
            Route::get('/roots', [ZoneController::class, 'roots'])->middleware('permission:zones.view');
            Route::get('/search', [ZoneController::class, 'search'])->middleware('permission:zones.view');
            Route::get('/level/{level}', [ZoneController::class, 'byLevel'])->middleware('permission:zones.view');
            Route::get('/{id}/children', [ZoneController::class, 'children'])->middleware('permission:zones.view');
            Route::get('/{id}/centers', [ZoneController::class, 'centers'])->middleware('permission:zones.view');
            Route::get('/{id}/hierarchy', [ZoneController::class, 'hierarchy'])->middleware('permission:zones.view');
            Route::get('/{id}', [ZoneController::class, 'show'])->middleware('permission:zones.view');
            Route::put('/{id}', [ZoneController::class, 'update'])->middleware('permission:zones.edit');
            Route::delete('/{id}', [ZoneController::class, 'destroy'])->middleware('permission:zones.delete');
        });

        // Classification - Fields
        Route::prefix('fields')->group(function () {
            Route::get('/', [FieldController::class, 'index'])->middleware('permission:fields.view');
            Route::post('/', [FieldController::class, 'store'])->middleware('permission:fields.create');
            Route::post('/import', [FieldController::class, 'import'])->middleware('permission:fields.create');
            Route::get('/export', [FieldController::class, 'export'])->middleware('permission:fields.view');
            Route::get('/sample', [FieldController::class, 'downloadSample']);
            Route::get('/active', [FieldController::class, 'active'])->middleware('permission:fields.view');
            Route::get('/search', [FieldController::class, 'search'])->middleware('permission:fields.view');
            Route::get('/{id}', [FieldController::class, 'show'])->middleware('permission:fields.view');
            Route::put('/{id}', [FieldController::class, 'update'])->middleware('permission:fields.edit');
            Route::delete('/{id}', [FieldController::class, 'destroy'])->middleware('permission:fields.delete');
        });

        // Classification - Specialties
        Route::prefix('specialties')->group(function () {
            Route::get('/', [SpecialtyController::class, 'index'])->middleware('permission:specialties.view');
            Route::post('/', [SpecialtyController::class, 'store'])->middleware('permission:specialties.create');
            Route::post('/import', [SpecialtyController::class, 'import'])->middleware('permission:specialties.create');
            Route::get('/export', [SpecialtyController::class, 'export'])->middleware('permission:specialties.view');
            Route::get('/sample', [SpecialtyController::class, 'downloadSample']);
            Route::get('/active', [SpecialtyController::class, 'active'])->middleware('permission:specialties.view');
            Route::get('/search', [SpecialtyController::class, 'search'])->middleware('permission:specialties.view');
            Route::get('/field/{fieldId}', [SpecialtyController::class, 'byField'])->middleware('permission:specialties.view');
            Route::get('/{id}', [SpecialtyController::class, 'show'])->middleware('permission:specialties.view');
            Route::put('/{id}', [SpecialtyController::class, 'update'])->middleware('permission:specialties.edit');
            Route::delete('/{id}', [SpecialtyController::class, 'destroy'])->middleware('permission:specialties.delete');
        });

        // Classification - Ranks
        Route::prefix('ranks')->group(function () {
            Route::get('/', [RankController::class, 'index'])->middleware('permission:ranks.view');
            Route::post('/', [RankController::class, 'store'])->middleware('permission:ranks.create');
            Route::post('/import', [RankController::class, 'import'])->middleware('permission:ranks.create');
            Route::get('/export', [RankController::class, 'export'])->middleware('permission:ranks.view');
            Route::get('/sample', [RankController::class, 'downloadSample']);
            Route::get('/active', [RankController::class, 'active'])->middleware('permission:ranks.view');
            Route::get('/search', [RankController::class, 'search'])->middleware('permission:ranks.view');
            Route::get('/{id}', [RankController::class, 'show'])->middleware('permission:ranks.view');
            Route::put('/{id}', [RankController::class, 'update'])->middleware('permission:ranks.edit');
            Route::delete('/{id}', [RankController::class, 'destroy'])->middleware('permission:ranks.delete');
        });

        // Classification - Categories
        Route::prefix('categories')->group(function () {
            Route::get('/', [CategoryController::class, 'index'])->middleware('permission:categories.view');
            Route::post('/', [CategoryController::class, 'store'])->middleware('permission:categories.create');
            Route::post('/import', [CategoryController::class, 'import'])->middleware('permission:categories.create');
            Route::get('/export', [CategoryController::class, 'export'])->middleware('permission:categories.view');
            Route::get('/sample', [CategoryController::class, 'downloadSample']);
            Route::get('/active', [CategoryController::class, 'active'])->middleware('permission:categories.view');
            Route::get('/search', [CategoryController::class, 'search'])->middleware('permission:categories.view');
            Route::get('/{id}', [CategoryController::class, 'show'])->middleware('permission:categories.view');
            Route::put('/{id}', [CategoryController::class, 'update'])->middleware('permission:categories.edit');
            Route::delete('/{id}', [CategoryController::class, 'destroy'])->middleware('permission:categories.delete');
        });

        // Classification - Mappings
        Route::prefix('classifications')->group(function () {
            Route::get('/', [ClassificationController::class, 'index'])->middleware('permission:classifications.view');
            Route::post('/', [ClassificationController::class, 'store'])->middleware('permission:classifications.create');
            Route::post('/import', [ClassificationController::class, 'import'])->middleware('permission:classifications.create');
            Route::get('/export', [ClassificationController::class, 'export'])->middleware('permission:classifications.view');
            Route::get('/sample', [ClassificationController::class, 'downloadSample']);
            Route::post('/resolve', [ClassificationController::class, 'resolve'])->middleware('permission:classifications.view');
            Route::post('/category', [ClassificationController::class, 'category'])->middleware('permission:classifications.view');
            Route::get('/{id}', [ClassificationController::class, 'show'])->middleware('permission:classifications.view');
            Route::put('/{id}', [ClassificationController::class, 'update'])->middleware('permission:classifications.edit');
            Route::delete('/{id}', [ClassificationController::class, 'destroy'])->middleware('permission:classifications.delete');
        });

        // Educational Degrees
        Route::prefix('educational-degrees')->group(function () {
            Route::get('/', [EducationalDegreeController::class, 'index'])->middleware('permission:educational-degrees.view');
            Route::post('/', [EducationalDegreeController::class, 'store'])->middleware('permission:educational-degrees.create');
            Route::post('/import', [EducationalDegreeController::class, 'import']);
            Route::get('/export', [EducationalDegreeController::class, 'export']);
            Route::get('/sample', [EducationalDegreeController::class, 'downloadSample']);
            Route::get('/active', [EducationalDegreeController::class, 'active'])->middleware('permission:educational-degrees.view');
            Route::get('/search', [EducationalDegreeController::class, 'search'])->middleware('permission:educational-degrees.view');
            Route::get('/{id}', [EducationalDegreeController::class, 'show'])->middleware('permission:educational-degrees.view');
            Route::put('/{id}', [EducationalDegreeController::class, 'update'])->middleware('permission:educational-degrees.edit');
            Route::patch('/{id}/toggle-status', [EducationalDegreeController::class, 'toggleStatus'])->middleware('permission:educational-degrees.edit');
            Route::delete('/{id}', [EducationalDegreeController::class, 'destroy'])->middleware('permission:educational-degrees.delete');
        });

        // Departments
        Route::prefix('departments')->group(function () {
            Route::get('/', [DepartmentController::class, 'index'])->middleware('permission:departments.view');
            Route::post('/', [DepartmentController::class, 'store'])->middleware('permission:departments.create');
            Route::post('/import', [DepartmentController::class, 'import']);
            Route::get('/export', [DepartmentController::class, 'export']);
            Route::get('/sample', [DepartmentController::class, 'downloadSample']);
            Route::get('/active', [DepartmentController::class, 'active'])->middleware('permission:departments.view');
            Route::get('/search', [DepartmentController::class, 'search'])->middleware('permission:departments.view');
            Route::get('/{id}', [DepartmentController::class, 'show'])->middleware('permission:departments.view');
            Route::put('/{id}', [DepartmentController::class, 'update'])->middleware('permission:departments.edit');
            Route::patch('/{id}/toggle-status', [DepartmentController::class, 'toggleStatus'])->middleware('permission:departments.edit');
            Route::delete('/{id}', [DepartmentController::class, 'destroy'])->middleware('permission:departments.delete');
        });

        // Clinic Assignments
        Route::prefix('clinic-assignments')->group(function () {
            Route::get('/', [ClinicAssignmentController::class, 'index'])->middleware('permission:clinic-assignments.view');
            Route::post('/', [ClinicAssignmentController::class, 'store'])->middleware('permission:clinic-assignments.create');
            Route::post('/import', [ClinicAssignmentController::class, 'import']);
            Route::get('/export/{format}', [ClinicAssignmentController::class, 'export']);
            Route::get('/sample', [ClinicAssignmentController::class, 'downloadSample']);
            Route::get('/active', [ClinicAssignmentController::class, 'active'])->middleware('permission:clinic-assignments.view');
            Route::get('/search', [ClinicAssignmentController::class, 'search'])->middleware('permission:clinic-assignments.view');
            Route::get('/{id}', [ClinicAssignmentController::class, 'show'])->middleware('permission:clinic-assignments.view');
            Route::put('/{id}', [ClinicAssignmentController::class, 'update'])->middleware('permission:clinic-assignments.edit');
            Route::patch('/{id}/toggle-status', [ClinicAssignmentController::class, 'toggleStatus'])->middleware('permission:clinic-assignments.edit');
            Route::delete('/{id}', [ClinicAssignmentController::class, 'destroy'])->middleware('permission:clinic-assignments.delete');
        });

        // Medications
        Route::prefix('medications')->group(function () {
            Route::get('/', [MedicationController::class, 'index'])->middleware('permission:medications.view');
            Route::post('/', [MedicationController::class, 'store'])->middleware('permission:medications.create');
            Route::get('/export', [MedicationController::class, 'export'])->middleware('permission:medications.export');
            Route::post('/import', [MedicationController::class, 'import'])->middleware('permission:medications.import');
            Route::get('/template', [MedicationController::class, 'template']);
            Route::get('/active', [MedicationController::class, 'active'])->middleware('permission:medications.view');
            Route::get('/{id}', [MedicationController::class, 'show'])->middleware('permission:medications.view');
            Route::put('/{id}', [MedicationController::class, 'update'])->middleware('permission:medications.edit');
            Route::delete('/{id}', [MedicationController::class, 'destroy'])->middleware('permission:medications.delete');
        });

        // PHC Medications (links)
        Route::prefix('phc-medications')->group(function () {
            Route::get('/', [PhcMedicationController::class, 'index'])->middleware('permission:medications.view');
            Route::post('/', [PhcMedicationController::class, 'store'])->middleware('permission:medications.create');
            Route::get('/export', [PhcMedicationController::class, 'export'])->middleware('permission:phc-medications.export');
            Route::post('/import', [PhcMedicationController::class, 'import'])->middleware('permission:phc-medications.import');
            Route::get('/template', [PhcMedicationController::class, 'template']);
            Route::get('/by-center/{phcCenterId}', [PhcMedicationController::class, 'byCenter'])->middleware('permission:medications.view');
            Route::get('/{id}', [PhcMedicationController::class, 'show'])->middleware('permission:medications.view');
            Route::put('/{id}', [PhcMedicationController::class, 'update'])->middleware('permission:medications.edit');
            Route::delete('/{id}', [PhcMedicationController::class, 'destroy'])->middleware('permission:medications.delete');
        });

        // Medication Evaluation Templates
        Route::prefix('medication-evaluation-templates')->middleware('permission:medication-eval-templates.view')->group(function () {
            Route::get('/', [MedicationEvaluationTemplateController::class, 'index']);
            Route::post('/', [MedicationEvaluationTemplateController::class, 'store'])->middleware('permission:medication-eval-templates.create');
            Route::get('/{id}', [MedicationEvaluationTemplateController::class, 'show']);
            Route::put('/{id}', [MedicationEvaluationTemplateController::class, 'update'])->middleware('permission:medication-eval-templates.edit');
            Route::delete('/{id}', [MedicationEvaluationTemplateController::class, 'destroy'])->middleware('permission:medication-eval-templates.delete');
        });

        // Medication Evaluations
        Route::prefix('medication-evaluations')->middleware('permission:medication-evaluations.view')->group(function () {
            Route::get('/', [MedicationEvaluationController::class, 'index']);
            Route::post('/', [MedicationEvaluationController::class, 'store'])->middleware('permission:medication-evaluations.create');
            Route::get('/{id}', [MedicationEvaluationController::class, 'show']);
            Route::put('/{id}', [MedicationEvaluationController::class, 'update'])->middleware('permission:medication-evaluations.edit');
            Route::delete('/{id}', [MedicationEvaluationController::class, 'destroy'])->middleware('permission:medication-evaluations.delete');
        });

        // Professionals
        Route::prefix('professionals')->group(function () {
            Route::get('/', [ProfessionalController::class, 'index'])->middleware('permission:professionals.view');
            Route::post('/', [ProfessionalController::class, 'store'])->middleware('permission:professionals.create');
            Route::post('/import', [ProfessionalController::class, 'import']);
            Route::get('/export/{format}', [ProfessionalController::class, 'export']);
            Route::get('/sample', [ProfessionalController::class, 'downloadSample']);
            Route::get('/active', [ProfessionalController::class, 'active'])->middleware('permission:professionals.view');
            Route::get('/search', [ProfessionalController::class, 'search'])->middleware('permission:professionals.view');
            Route::get('/{id}', [ProfessionalController::class, 'show'])->middleware('permission:professionals.view');
            Route::put('/{id}', [ProfessionalController::class, 'update'])->middleware('permission:professionals.edit');
            Route::patch('/{id}/toggle-status', [ProfessionalController::class, 'toggleStatus'])->middleware('permission:professionals.edit');
            Route::delete('/{id}', [ProfessionalController::class, 'destroy'])->middleware('permission:professionals.delete');
        });

        // Roles & Permissions
        Route::prefix('roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->middleware('permission:roles.view');
            Route::post('/', [RoleController::class, 'store'])->middleware('permission:roles.create');
            Route::get('/{role}', [RoleController::class, 'show'])->middleware('permission:roles.view');
            Route::put('/{role}', [RoleController::class, 'update'])->middleware('permission:roles.edit');
            Route::delete('/{role}', [RoleController::class, 'destroy'])->middleware('permission:roles.delete');
            Route::get('/{role}/permissions', [RoleController::class, 'getPermissions'])->middleware('permission:roles.assign_permissions');
            Route::put('/{role}/permissions', [RoleController::class, 'syncPermissions'])->middleware('permission:roles.assign_permissions');
            Route::get('/{role}/users', [RoleController::class, 'getUsers'])->middleware('permission:roles.assign_users');
            Route::put('/{role}/users', [RoleController::class, 'syncUsers'])->middleware('permission:roles.assign_users');
        });

        Route::prefix('permissions')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->middleware('permission:permissions.view');
            Route::post('/', [PermissionController::class, 'store']);
            Route::get('/{permission}', [PermissionController::class, 'show']);
            Route::put('/{permission}', [PermissionController::class, 'update']);
            Route::delete('/{permission}', [PermissionController::class, 'destroy']);
        });

        Route::prefix('users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::post('/', [UserController::class, 'store'])->middleware('permission:users.manage');
            Route::get('/export', [UserController::class, 'export']);
            Route::post('/import', [UserController::class, 'import']);
            Route::get('/{id}', [UserController::class, 'show'])->middleware('permission:users.view');
            Route::put('/{id}', [UserController::class, 'update'])->middleware('permission:users.manage');
            Route::delete('/{id}', [UserController::class, 'destroy'])->middleware('permission:users.manage');
            Route::patch('/{id}/toggle-active', [UserController::class, 'toggleActive'])->middleware('permission:users.manage');
            Route::get('/{user}/roles', [RoleController::class, 'getUserRoles'])->middleware('permission:roles.assign_users');
            Route::put('/{user}/roles', [RoleController::class, 'assignUserRoles'])->middleware('permission:roles.assign_users');
        });
    });
});
