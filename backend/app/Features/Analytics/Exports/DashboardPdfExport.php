<?php

namespace App\Features\Analytics\Exports;

use App\Features\Analytics\Services\AnalyticsService;
use Dompdf\Dompdf;
use Illuminate\Http\Response;

class DashboardPdfExport
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    public function generate(): Response
    {
        $dashboard = $this->analyticsService->getDashboardSummary();
        $trends = $this->analyticsService->getEvaluationTrends('month');
        $distribution = $this->analyticsService->getScoreDistribution();
        $classification = $this->analyticsService->getClassificationBreakdown();
        $centers = $this->analyticsService->getCenterPerformance();
        $zones = $this->analyticsService->getZoneAnalytics();
        $recentActivity = $this->analyticsService->getRecentActivity(10);

        $html = view('exports.dashboard-pdf', [
            'dashboard' => $dashboard,
            'trends' => $trends,
            'distribution' => $distribution,
            'classification' => $classification,
            'centers' => collect($centers)->sortByDesc('avg_percentage')->take(10)->values()->all(),
            'zones' => $zones,
            'recentActivity' => $recentActivity,
            'generatedAt' => now()->format('F j, Y g:i A'),
        ])->render();

        // Prevent accidental output from corrupting the PDF binary
        ob_start();

        // Suppress deprecation warnings for the entire Dompdf lifecycle
        $previousLevel = error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

        try {
            $dompdf = new Dompdf;
            $dompdf->setPaper('a4', 'portrait');
            $dompdf->loadHtml($html);
            $dompdf->set_option('isHtml5ParserEnabled', true);
            $dompdf->set_option('isRemoteEnabled', true);
            $dompdf->render();

            return response($dompdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="dashboard-report-'.now()->format('Y-m-d').'.pdf"');
        } finally {
            error_reporting($previousLevel);
            ob_end_clean();
        }
    }
}
