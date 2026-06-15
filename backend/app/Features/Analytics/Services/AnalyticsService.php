<?php

namespace App\Features\Analytics\Services;

use App\Models\ActionPlan;
use App\Models\Evaluation;
use App\Models\PhcCenter;
use App\Models\Question;
use App\Models\Staff;
use App\Models\Zone;

class AnalyticsService
{
    public function getDashboardSummary(): array
    {
        $totalStaff = Staff::count();
        $totalCenters = PhcCenter::count();
        $totalEvaluations = Evaluation::count();
        $completedEvaluations = Evaluation::where('status', 'completed')->count();
        $inProgressEvaluations = Evaluation::where('status', 'in_progress')->count();

        $averagePercentage = Evaluation::where('status', 'completed')
            ->whereNotNull('percentage')
            ->avg('percentage') ?? 0;

        $activeCenters = PhcCenter::where('is_active', true)->count();
        $activeStaff = Staff::where('is_active', true)->count();

        return [
            'total_staff' => $totalStaff,
            'active_staff' => $activeStaff,
            'total_centers' => $totalCenters,
            'active_centers' => $activeCenters,
            'total_evaluations' => $totalEvaluations,
            'completed_evaluations' => $completedEvaluations,
            'in_progress_evaluations' => $inProgressEvaluations,
            'average_percentage' => round((float) $averagePercentage, 2),
            'completion_rate' => $totalEvaluations > 0
                ? round(($completedEvaluations / $totalEvaluations) * 100, 2)
                : 0,
        ];
    }

    public function getEvaluationTrends(string $period = 'month'): array
    {
        $query = Evaluation::where('status', 'completed')
            ->whereNotNull('completed_at');

        switch ($period) {
            case 'day':
                $data = $query
                    ->selectRaw('DATE(completed_at) as period, COUNT(*) as count, AVG(percentage) as avg_percentage')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->limit(30)
                    ->get();
                break;

            case 'week':
                $data = $query
                    ->selectRaw('YEARWEEK(completed_at) as period, COUNT(*) as count, AVG(percentage) as avg_percentage')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->limit(12)
                    ->get();
                break;

            default:
                $data = $query
                    ->selectRaw("DATE_FORMAT(completed_at, '%Y-%m') as period, COUNT(*) as count, AVG(percentage) as avg_percentage")
                    ->groupBy('period')
                    ->orderBy('period')
                    ->limit(12)
                    ->get();
                break;
        }

        return $data->map(fn ($row) => [
            'period' => $row->period,
            'count' => (int) $row->count,
            'avg_percentage' => round((float) $row->avg_percentage, 2),
        ])->values()->toArray();
    }

    public function getTopPerformers(int $limit = 10): array
    {
        return PhcCenter::where('is_active', true)
            ->whereHas('evaluations', function ($query) {
                $query->where('status', 'completed')
                    ->whereNotNull('percentage');
            })
            ->withCount(['evaluations' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->withAvg(['evaluations' => function ($query) {
                $query->where('status', 'completed');
            }], 'percentage')
            ->orderByDesc('evaluations_avg_percentage')
            ->limit($limit)
            ->get()
            ->map(fn ($center) => [
                'id' => $center->id,
                'name' => $center->name,
                'code' => $center->code,
                'classification' => $center->classification,
                'evaluations_count' => $center->evaluations_count,
                'avg_percentage' => round((float) ($center->evaluations_avg_percentage ?? 0), 2),
            ])
            ->values()
            ->toArray();
    }

    public function getCenterPerformance(): array
    {
        return PhcCenter::withCount(['evaluations' => function ($query) {
            $query->where('status', 'completed');
        }])
            ->withAvg(['evaluations' => function ($query) {
                $query->where('status', 'completed');
            }], 'percentage')
            ->withCount('staff')
            ->get()
            ->map(fn ($center) => [
                'id' => $center->id,
                'name' => $center->name,
                'code' => $center->code,
                'classification' => $center->classification,
                'region' => $center->region,
                'latitude' => $center->latitude ? (float) $center->latitude : null,
                'longitude' => $center->longitude ? (float) $center->longitude : null,
                'staff_count' => $center->staff_count,
                'evaluations_count' => $center->evaluations_count,
                'avg_percentage' => round((float) ($center->evaluations_avg_percentage ?? 0), 2),
                'is_active' => $center->is_active,
            ])
            ->values()
            ->toArray();
    }

    public function getQuestionAnalytics(): array
    {
        return Question::withCount(['answers' => function ($query) {
            $query->whereHas('evaluation', function ($q) {
                $q->where('status', 'completed');
            });
        }])
            ->withAvg(['answers' => function ($query) {
                $query->whereHas('evaluation', function ($q) {
                    $q->where('status', 'completed');
                });
            }], 'score')
            ->orderByDesc('answers_count')
            ->limit(20)
            ->get()
            ->map(fn ($question) => [
                'id' => $question->id,
                'text' => $question->text,
                'category' => $question->category,
                'type' => $question->type,
                'answers_count' => $question->answers_count,
                'avg_score' => round((float) ($question->answers_avg_score ?? 0), 2),
            ])
            ->values()
            ->toArray();
    }

    public function getActionPlanStatistics(): array
    {
        return [
            'total' => ActionPlan::count(),
            'pending' => ActionPlan::where('status', 'pending')->count(),
            'in_progress' => ActionPlan::where('status', 'in_progress')->count(),
            'completed' => ActionPlan::where('status', 'completed')->count(),
            'overdue' => ActionPlan::where('status', '!=', 'completed')
                ->where('due_date', '<', now())
                ->count(),
        ];
    }

    public function getScoreDistribution(): array
    {
        $scores = Evaluation::where('status', 'completed')
            ->whereNotNull('percentage')
            ->pluck('percentage');

        $ranges = [
            '0-20' => 0,
            '21-40' => 0,
            '41-60' => 0,
            '61-80' => 0,
            '81-100' => 0,
        ];

        foreach ($scores as $score) {
            $score = (float) $score;
            if ($score <= 20) {
                $ranges['0-20']++;
            } elseif ($score <= 40) {
                $ranges['21-40']++;
            } elseif ($score <= 60) {
                $ranges['41-60']++;
            } elseif ($score <= 80) {
                $ranges['61-80']++;
            } else {
                $ranges['81-100']++;
            }
        }

        return $ranges;
    }

    public function getZoneAnalytics(): array
    {
        return Zone::withCount(['centers' => function ($query) {
            $query->where('is_active', true);
        }])
            ->get()
            ->map(fn ($zone) => [
                'id' => $zone->id,
                'name' => $zone->name,
                'level' => $zone->level,
                'centers_count' => $zone->centers_count,
                'evaluations_count' => Evaluation::whereIn('phc_center_id', $zone->centers()->pluck('id'))->where('status', 'completed')->count(),
                'avg_percentage' => round((float) (Evaluation::whereIn('phc_center_id', $zone->centers()->pluck('id'))->where('status', 'completed')->avg('percentage') ?? 0), 2),
            ])
            ->values()
            ->toArray();
    }

    public function getClassificationBreakdown(): array
    {
        return PhcCenter::where('is_active', true)
            ->select('classification')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('AVG(CASE WHEN e.status = "completed" THEN e.percentage END) as avg_percentage')
            ->leftJoin('evaluations as e', function ($join) {
                $join->on('phc_centers.id', '=', 'e.phc_center_id')
                    ->where('e.status', 'completed');
            })
            ->groupBy('classification')
            ->get()
            ->map(fn ($row) => [
                'classification' => $row->classification,
                'count' => (int) $row->count,
                'avg_percentage' => round((float) ($row->avg_percentage ?? 0), 2),
            ])
            ->values()
            ->toArray();
    }

    public function getRecentActivity(int $limit = 10): array
    {
        return Evaluation::with(['center', 'template', 'evaluator'])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn ($evaluation) => [
                'id' => $evaluation->id,
                'template_name' => $evaluation->template?->name,
                'center_name' => $evaluation->center?->name,
                'status' => $evaluation->status,
                'percentage' => $evaluation->percentage ? round((float) $evaluation->percentage, 2) : null,
                'updated_at' => $evaluation->updated_at?->toISOString(),
            ])
            ->values()
            ->toArray();
    }
}
