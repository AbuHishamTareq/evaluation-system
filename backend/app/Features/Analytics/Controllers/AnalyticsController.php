<?php

namespace App\Features\Analytics\Controllers;

use App\Features\Analytics\Exports\DashboardExcelExport;
use App\Features\Analytics\Exports\DashboardPdfExport;
use App\Features\Analytics\Services\AnalyticsService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

/**
 * @group Analytics & Reports
 *
 * APIs for analytics dashboards, reports, and data visualization.
 */
class AnalyticsController extends BaseApiController
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    public function dashboard(): JsonResponse
    {
        $summary = $this->analyticsService->getDashboardSummary();

        return $this->successResponse($summary, 'Dashboard summary retrieved successfully');
    }

    public function evaluationTrends(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month');

        if (! in_array($period, ['day', 'week', 'month'])) {
            return $this->errorResponse('Invalid period parameter', 400);
        }

        $trends = $this->analyticsService->getEvaluationTrends($period);

        return $this->successResponse($trends, 'Evaluation trends retrieved successfully');
    }

    public function topPerformers(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);

        $performers = $this->analyticsService->getTopPerformers((int) $limit);

        return $this->successResponse($performers, 'Top performers retrieved successfully');
    }

    public function centerPerformance(): JsonResponse
    {
        $performance = $this->analyticsService->getCenterPerformance();

        return $this->successResponse($performance, 'Center performance retrieved successfully');
    }

    public function questionAnalytics(): JsonResponse
    {
        $analytics = $this->analyticsService->getQuestionAnalytics();

        return $this->successResponse($analytics, 'Question analytics retrieved successfully');
    }

    public function actionPlanStatistics(): JsonResponse
    {
        $stats = $this->analyticsService->getActionPlanStatistics();

        return $this->successResponse($stats, 'Action plan statistics retrieved successfully');
    }

    public function scoreDistribution(): JsonResponse
    {
        $distribution = $this->analyticsService->getScoreDistribution();

        return $this->successResponse($distribution, 'Score distribution retrieved successfully');
    }

    public function zoneAnalytics(): JsonResponse
    {
        $analytics = $this->analyticsService->getZoneAnalytics();

        return $this->successResponse($analytics, 'Zone analytics retrieved successfully');
    }

    public function classificationBreakdown(): JsonResponse
    {
        $breakdown = $this->analyticsService->getClassificationBreakdown();

        return $this->successResponse($breakdown, 'Classification breakdown retrieved successfully');
    }

    public function recentActivity(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);

        $activity = $this->analyticsService->getRecentActivity((int) $limit);

        return $this->successResponse($activity, 'Recent activity retrieved successfully');
    }

    public function compositeScore(Request $request): JsonResponse
    {
        $phcCenterId = $request->get('phc_center_id');

        $score = $this->analyticsService->getCompositeScore($phcCenterId ? (int) $phcCenterId : null);

        return $this->successResponse($score, 'Composite score retrieved successfully');
    }

    public function exportPdf()
    {
        $export = app(DashboardPdfExport::class);

        return $export->generate();
    }

    public function exportExcel()
    {
        $export = new DashboardExcelExport($this->analyticsService);

        return Excel::download($export, 'dashboard-report-'.now()->format('Y-m-d').'.xlsx');
    }
}
