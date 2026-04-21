<?php

namespace App\Services\Dashboard;

use App\Models\Department;
use App\Models\Evaluation;
use App\Models\IncidentReport;
use App\Models\Issue;
use App\Models\PhcCenter;
use App\Models\Region;
use App\Models\Shift;
use App\Models\StaffProfile;

class DashboardService
{
    public function getKpiSummary(?int $phcCenterId = null, ?int $regionId = null): array
    {
        $incidentQuery = IncidentReport::query();
        $evaluationQuery = Evaluation::query();
        $issueQuery = Issue::query();
        $staffQuery = StaffProfile::query();
        $shiftQuery = Shift::query();

        if ($phcCenterId) {
            $incidentQuery->where('phc_center_id', $phcCenterId);
            $issueQuery->where('phc_center_id', $phcCenterId);
            $staffQuery->where('phc_center_id', $phcCenterId);
            $shiftQuery->whereHas('staffProfile', fn ($q) => $q->where('phc_center_id', $phcCenterId));
        }

        if ($regionId) {
            $centerIds = PhcCenter::where('region_id', $regionId)->pluck('id');
            $incidentQuery->whereIn('phc_center_id', $centerIds);
            $issueQuery->whereIn('phc_center_id', $centerIds);
            $staffQuery->whereIn('phc_center_id', $centerIds);
        }

        return [
            'incidents' => [
                'total' => $incidentQuery->count(),
                'open' => $incidentQuery->where('status', 'open')->count(),
                'high_critical' => $incidentQuery->whereIn('severity', ['high', 'critical'])->count(),
                'by_type' => $incidentQuery->selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')->pluck('count', 'type')->toArray(),
            ],
            'evaluations' => [
                'total' => $evaluationQuery->count(),
                'completed' => $evaluationQuery->where('status', 'completed')->count(),
                'avg_score' => round($evaluationQuery->where('status', 'completed')->avg('percentage') ?? 0, 1),
            ],
            'issues' => [
                'total' => $issueQuery->count(),
                'open' => $issueQuery->whereIn('status', ['open', 'in_progress'])->count(),
                'urgent' => $issueQuery->where('priority', 'urgent')->count(),
            ],
            'staff' => [
                'total' => $staffQuery->count(),
                'active' => $staffQuery->where('employment_status', 'active')->count(),
            ],
            'shifts' => [
                'total' => $shiftQuery->count(),
                'scheduled' => $shiftQuery->where('status', 'scheduled')->count(),
            ],
        ];
    }

    public function getDrillDown(string $entityType, int $entityId, array $breadcrumbs = []): array
    {
        $breadcrumbs[] = [
            'type' => $entityType,
            'id' => $entityId,
            'label' => $this->getEntityLabel($entityType, $entityId),
        ];

        $data = match ($entityType) {
            'phc_center' => $this->getPhcCenterDetails($entityId),
            'region' => $this->getRegionDetails($entityId),
            'department' => $this->getDepartmentDetails($entityId),
            'staff' => $this->getStaffDetails($entityId),
            default => [],
        };

        $children = $this->getChildEntities($entityType, $entityId);

        return [
            'current' => $data,
            'breadcrumbs' => $breadcrumbs,
            'children' => $children,
        ];
    }

    public function getComparativeMetrics(?int $phcCenterId = null, ?int $regionId = null): array
    {
        $myStats = $this->getKpiSummary($phcCenterId, $regionId);

        if ($regionId) {
            $otherCenterIds = PhcCenter::where('region_id', '!=', $regionId)->pluck('id');
            $regionalStats = $this->getKpiSummary(null, $regionId);
            $nationalStats = $this->getKpiSummary();
        } elseif ($phcCenterId) {
            $otherPhcInRegion = PhcCenter::where('id', '!=', $phcCenterId)->pluck('id');
            $myRegionId = PhcCenter::find($phcCenterId)?->region_id;
            $regionalStats = $myRegionId ? $this->getKpiSummary(null, $myRegionId) : $myStats;
            $nationalStats = $this->getKpiSummary();
        } else {
            $regionalStats = $myStats;
            $nationalStats = $myStats;
        }

        return [
            'my_center' => $myStats,
            'regional_avg' => $regionalStats,
            'national_avg' => $nationalStats,
            'comparison' => [
                'incidents_vs_region' => $this->calculatePercentDiff(
                    $myStats['incidents']['total'],
                    $regionalStats['incidents']['total']
                ),
                'incidents_vs_national' => $this->calculatePercentDiff(
                    $myStats['incidents']['total'],
                    $nationalStats['incidents']['total']
                ),
                'eval_score_vs_region' => $this->calculatePercentDiff(
                    $myStats['evaluations']['avg_score'],
                    $regionalStats['evaluations']['avg_score']
                ),
                'eval_score_vs_national' => $this->calculatePercentDiff(
                    $myStats['evaluations']['avg_score'],
                    $nationalStats['evaluations']['avg_score']
                ),
            ],
        ];
    }

    public function getTrendData(string $metric, int $days = 30): array
    {
        $dates = [];
        for ($i = $days; $i >= 0; $i--) {
            $dates[] = now()->subDays($i)->toDateString();
        }

        $data = match ($metric) {
            'incidents' => $this->getIncidentTrend($dates),
            'evaluations' => $this->getEvaluationTrend($dates),
            'issues' => $this->getIssueTrend($dates),
            default => [],
        };

        return [
            'metric' => $metric,
            'period' => "{$days} days",
            'data' => $data,
        ];
    }

    protected function getEntityLabel(string $type, int $id): string
    {
        return match ($type) {
            'phc_center' => PhcCenter::find($id)?->name ?? 'Unknown',
            'region' => Region::find($id)?->name ?? 'Unknown',
            'department' => Department::find($id)?->name ?? 'Unknown',
            'staff' => StaffProfile::find($id)?->full_name ?? 'Unknown',
            default => "ID: {$id}",
        };
    }

    protected function getPhcCenterDetails(int $id): array
    {
        $center = PhcCenter::withTrashed()->find($id);

        if (! $center) {
            return ['name' => 'Unknown', 'code' => '', 'stats' => []];
        }

        return [
            'name' => $center->name,
            'code' => $center->code,
            'stats' => $this->getKpiSummary($id),
        ];
    }

    protected function getRegionDetails(int $id): array
    {
        $region = Region::withTrashed()->find($id);

        if (! $region) {
            return ['name' => 'Unknown', 'code' => '', 'stats' => []];
        }

        return [
            'name' => $region->name,
            'code' => $region->code,
            'center_count' => $region->phcCenters()->count(),
            'stats' => $this->getKpiSummary(null, $id),
        ];
    }

    protected function getDepartmentDetails(int $id): array
    {
        $dept = Department::findOrFail($id);

        return [
            'name' => $dept->name,
            'staff_count' => $dept->staffProfiles()->count(),
        ];
    }

    protected function getStaffDetails(int $id): array
    {
        $staff = StaffProfile::findOrFail($id);

        return [
            'name' => $staff->full_name,
            'employee_id' => $staff->employee_id,
            'employment_status' => $staff->employment_status,
        ];
    }

    protected function getChildEntities(string $type, int $id): array
    {
        return match ($type) {
            'region' => Region::find($id)?->phcCenters()->select('id', 'name', 'code')->get()->toArray() ?? [],
            'phc_center' => Department::where('phc_center_id', $id)->select('id', 'name', 'code')->get()->toArray() ?? [],
            default => [],
        };
    }

    protected function calculatePercentDiff(int|float $value, int|float $compare): float
    {
        if ($compare == 0) {
            return 0;
        }

        return round((($value - $compare) / $compare) * 100, 1);
    }

    protected function getIncidentTrend(array $dates): array
    {
        return collect($dates)->map(fn ($date) => [
            'date' => $date,
            'count' => IncidentReport::whereDate('created_at', $date)->count(),
        ])->toArray();
    }

    protected function getEvaluationTrend(array $dates): array
    {
        return collect($dates)->map(fn ($date) => [
            'date' => $date,
            'count' => Evaluation::whereDate('created_at', $date)->count(),
        ])->toArray();
    }

    protected function getIssueTrend(array $dates): array
    {
        return collect($dates)->map(fn ($date) => [
            'date' => $date,
            'count' => Issue::whereDate('created_at', $date)->count(),
        ])->toArray();
    }
}
