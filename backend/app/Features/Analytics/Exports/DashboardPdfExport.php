<?php

namespace App\Features\Analytics\Exports;

use App\Features\Analytics\Services\AnalyticsService;
use Barryvdh\DomPDF\Facade\Pdf;
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

        $pdf = Pdf::loadHTML($html)
            ->setPaper('a4', 'portrait')
            ->setOptions([
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
            ]);

        return response($pdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="dashboard-report-'.now()->format('Y-m-d').'.pdf"');
    }
}
