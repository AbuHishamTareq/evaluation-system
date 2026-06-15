<?php

namespace App\Features\Analytics\Exports;

use App\Features\Analytics\Services\AnalyticsService;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;

class DashboardExcelExport implements WithMultipleSheets
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    public function sheets(): array
    {
        return [
            new SummarySheet($this->analyticsService),
            new CentersSheet($this->analyticsService),
            new ZonesSheet($this->analyticsService),
            new TrendsSheet($this->analyticsService),
            new DistributionSheet($this->analyticsService),
            new ClassificationSheet($this->analyticsService),
            new ActivitySheet($this->analyticsService),
        ];
    }
}

class SummarySheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $data = $this->analyticsService->getDashboardSummary();

        return collect([
            ['Metric', 'Value'],
            ['Total Staff', $data['total_staff']],
            ['Active Staff', $data['active_staff']],
            ['Total Centers', $data['total_centers']],
            ['Active Centers', $data['active_centers']],
            ['Total Evaluations', $data['total_evaluations']],
            ['Completed Evaluations', $data['completed_evaluations']],
            ['In Progress Evaluations', $data['in_progress_evaluations']],
            ['Average Percentage', $data['average_percentage'].'%'],
            ['Completion Rate', $data['completion_rate'].'%'],
        ]);
    }

    public function headings(): array
    {
        return ['Metric', 'Value'];
    }

    public function title(): string
    {
        return 'Summary';
    }
}

class CentersSheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $centers = $this->analyticsService->getCenterPerformance();

        return collect($centers)->map(fn ($center) => [
            $center['name'],
            $center['code'],
            $center['classification'],
            $center['region'] ?? 'N/A',
            $center['staff_count'],
            $center['evaluations_count'],
            $center['avg_percentage'].'%',
            $center['is_active'] ? 'Active' : 'Inactive',
        ]);
    }

    public function headings(): array
    {
        return ['Name', 'Code', 'Classification', 'Region', 'Staff', 'Evaluations', 'Avg Score', 'Status'];
    }

    public function title(): string
    {
        return 'Centers';
    }
}

class ZonesSheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $zones = $this->analyticsService->getZoneAnalytics();

        return collect($zones)->map(fn ($zone) => [
            $zone['name'],
            $zone['level'],
            $zone['centers_count'],
            $zone['evaluations_count'],
            $zone['avg_percentage'].'%',
        ]);
    }

    public function headings(): array
    {
        return ['Name', 'Level', 'Centers', 'Evaluations', 'Avg Score'];
    }

    public function title(): string
    {
        return 'Zones';
    }
}

class TrendsSheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $trends = $this->analyticsService->getEvaluationTrends('month');

        return collect($trends)->map(fn ($trend) => [
            $trend['period'],
            $trend['count'],
            $trend['avg_percentage'].'%',
        ]);
    }

    public function headings(): array
    {
        return ['Period', 'Evaluations', 'Avg Score'];
    }

    public function title(): string
    {
        return 'Trends';
    }
}

class DistributionSheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $distribution = $this->analyticsService->getScoreDistribution();

        return collect($distribution)->map(fn ($count, $range) => [
            $range.'%',
            $count,
        ]);
    }

    public function headings(): array
    {
        return ['Score Range', 'Count'];
    }

    public function title(): string
    {
        return 'Distribution';
    }
}

class ClassificationSheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $classification = $this->analyticsService->getClassificationBreakdown();

        return collect($classification)->map(fn ($item) => [
            ucfirst($item['classification']),
            $item['count'],
            $item['avg_percentage'].'%',
        ]);
    }

    public function headings(): array
    {
        return ['Classification', 'Count', 'Avg Score'];
    }

    public function title(): string
    {
        return 'Classification';
    }
}

class ActivitySheet implements FromCollection, WithHeadings, WithTitle
{
    public function __construct(protected AnalyticsService $analyticsService) {}

    public function collection(): Collection
    {
        $activity = $this->analyticsService->getRecentActivity(20);

        return collect($activity)->map(fn ($item) => [
            $item['template_name'] ?? 'Untitled',
            $item['center_name'] ?? 'N/A',
            ucfirst(str_replace('_', ' ', $item['status'])),
            $item['percentage'] ? $item['percentage'].'%' : 'N/A',
            $item['updated_at'],
        ]);
    }

    public function headings(): array
    {
        return ['Template', 'Center', 'Status', 'Score', 'Updated At'];
    }

    public function title(): string
    {
        return 'Recent Activity';
    }
}
