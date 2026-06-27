<?php

namespace App\Features\Analytics\Services;

use App\Models\ActionPlan;
use App\Models\Evaluation;
use App\Models\MedicationEvaluation;
use App\Models\PhcCenter;
use App\Models\Question;
use App\Models\Staff;
use App\Models\Zone;

class AnalyticsService
{
    protected int $regularWeight;

    protected int $medicationWeight;

    public function __construct()
    {
        $weights = config('evaluation.composite_weights', ['regular' => 70, 'medication' => 30]);
        $this->regularWeight = $weights['regular'];
        $this->medicationWeight = $weights['medication'];
    }

    protected function getRegularAvg(int $phcCenterId): float
    {
        return round((float) (Evaluation::where('phc_center_id', $phcCenterId)
            ->where('status', 'completed')
            ->whereNotNull('percentage')
            ->avg('percentage') ?? 0), 2);
    }

    protected function getMedicationAvg(int $phcCenterId): float
    {
        return round((float) (MedicationEvaluation::where('phc_center_id', $phcCenterId)
            ->where('status', 'completed')
            ->whereNotNull('percentage')
            ->avg('percentage') ?? 0), 2);
    }

    protected function computeCompositeScore(float $regularAvg, float $medicationAvg): float
    {
        $totalWeight = $this->regularWeight + $this->medicationWeight;

        return $totalWeight > 0
            ? round(($this->regularWeight * $regularAvg + $this->medicationWeight * $medicationAvg) / $totalWeight, 2)
            : 0;
    }

    public function getDashboardSummary(): array
    {
        $totalStaff = Staff::count();
        $totalCenters = PhcCenter::count();
        $totalEvaluations = Evaluation::count();
        $completedEvaluations = Evaluation::where('status', 'completed')->count();
        $inProgressEvaluations = Evaluation::where('status', 'in_progress')->count();
        $totalMedicationEvaluations = MedicationEvaluation::count();
        $completedMedicationEvaluations = MedicationEvaluation::where('status', 'completed')->count();
        $inProgressMedicationEvaluations = MedicationEvaluation::where('status', 'in_progress')->count();

        $combinedTotal = $totalEvaluations + $totalMedicationEvaluations;
        $combinedCompleted = $completedEvaluations + $completedMedicationEvaluations;

        $regularPercentage = Evaluation::where('status', 'completed')
            ->whereNotNull('percentage')
            ->avg('percentage') ?? 0;

        $medicationPercentage = MedicationEvaluation::where('status', 'completed')
            ->whereNotNull('percentage')
            ->avg('percentage') ?? 0;

        $activeCenters = PhcCenter::where('is_active', true)->count();
        $activeStaff = Staff::where('is_active', true)->count();

        return [
            'total_staff' => $totalStaff,
            'active_staff' => $activeStaff,
            'total_centers' => $totalCenters,
            'active_centers' => $activeCenters,
            'total_evaluations' => $combinedTotal,
            'completed_evaluations' => $combinedCompleted,
            'in_progress_evaluations' => $inProgressEvaluations,
            'average_percentage' => round((float) $regularPercentage, 2),
            'completion_rate' => $combinedTotal > 0
                ? round(($combinedCompleted / $combinedTotal) * 100, 2)
                : 0,
            // Medication evaluation stats
            'total_medication_evaluations' => $totalMedicationEvaluations,
            'completed_medication_evaluations' => $completedMedicationEvaluations,
            'in_progress_medication_evaluations' => $inProgressMedicationEvaluations,
            'medication_average_percentage' => round((float) $medicationPercentage, 2),
            // Composite score
            'composite_average_percentage' => $this->computeCompositeScore(
                round((float) $regularPercentage, 2),
                round((float) $medicationPercentage, 2)
            ),
            'composite_weights' => [
                'regular' => $this->regularWeight,
                'medication' => $this->medicationWeight,
            ],
        ];
    }

    public function getEvaluationTrends(string $period = 'month'): array
    {
        $regularData = $this->trendQuery(new Evaluation, $period);
        $medicationData = $this->trendQuery(new MedicationEvaluation, $period);

        $periods = collect($regularData)->pluck('period')
            ->merge(collect($medicationData)->pluck('period'))
            ->unique()
            ->sort()
            ->values();

        return $periods->map(function ($periodLabel) use ($regularData, $medicationData) {
            $regular = collect($regularData)->firstWhere('period', $periodLabel);
            $medication = collect($medicationData)->firstWhere('period', $periodLabel);

            $regularAvg = $regular ? (float) $regular['avg_percentage'] : null;
            $medicationAvg = $medication ? (float) $medication['avg_percentage'] : null;
            $count = ($regular ? $regular['count'] : 0) + ($medication ? $medication['count'] : 0);

            return [
                'period' => $periodLabel,
                'count' => $count,
                'regular_avg_percentage' => $regularAvg,
                'medication_avg_percentage' => $medicationAvg,
            ];
        })->values()->toArray();
    }

    protected function trendQuery($model, string $period): array
    {
        $query = $model->where('status', 'completed')
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
            'avg_percentage' => round((float) ($row->avg_percentage ?? 0), 2),
        ])->values()->toArray();
    }

    public function getTopPerformers(int $limit = 10): array
    {
        return PhcCenter::where('is_active', true)
            ->get()
            ->map(fn ($center) => [
                'id' => $center->id,
                'name' => $center->name,
                'code' => $center->code,
                'classification' => $center->classification,
                'regular_avg_percentage' => $this->getRegularAvg($center->id),
                'medication_avg_percentage' => $this->getMedicationAvg($center->id),
                'composite_avg_percentage' => $this->computeCompositeScore(
                    $this->getRegularAvg($center->id),
                    $this->getMedicationAvg($center->id)
                ),
            ])
            ->filter(fn ($center) => $center['regular_avg_percentage'] > 0 || $center['medication_avg_percentage'] > 0)
            ->sortByDesc('composite_avg_percentage')
            ->values()
            ->take($limit)
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
            ->map(function ($center) {
                $regularAvg = $this->getRegularAvg($center->id);
                $medicationAvg = $this->getMedicationAvg($center->id);
                $medicationEvalsCount = MedicationEvaluation::where('phc_center_id', $center->id)
                    ->where('status', 'completed')
                    ->count();

                return [
                    'id' => $center->id,
                    'name' => $center->name,
                    'code' => $center->code,
                    'classification' => $center->classification,
                    'region' => $center->region,
                    'latitude' => $center->latitude ? (float) $center->latitude : null,
                    'longitude' => $center->longitude ? (float) $center->longitude : null,
                    'staff_count' => $center->staff_count,
                    'evaluations_count' => $center->evaluations_count + $medicationEvalsCount,
                    'medication_evaluations_count' => $medicationEvalsCount,
                    'avg_percentage' => $regularAvg,
                    'medication_avg_percentage' => $medicationAvg,
                    'composite_avg_percentage' => $this->computeCompositeScore($regularAvg, $medicationAvg),
                    'is_active' => $center->is_active,
                ];
            })
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
        $regularScores = Evaluation::where('status', 'completed')
            ->whereNotNull('percentage')
            ->pluck('percentage');
        $medicationScores = MedicationEvaluation::where('status', 'completed')
            ->whereNotNull('percentage')
            ->pluck('percentage');

        $scores = $regularScores->merge($medicationScores);

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
            ->map(function ($zone) {
                $centerIds = $zone->centers()->pluck('id');

                $regularAvg = round((float) (Evaluation::whereIn('phc_center_id', $centerIds)
                    ->where('status', 'completed')
                    ->avg('percentage') ?? 0), 2);

                $medicationAvg = round((float) (MedicationEvaluation::whereIn('phc_center_id', $centerIds)
                    ->where('status', 'completed')
                    ->avg('percentage') ?? 0), 2);

                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'level' => $zone->level,
                    'centers_count' => $zone->centers_count,
                    'evaluations_count' => Evaluation::whereIn('phc_center_id', $centerIds)->where('status', 'completed')->count(),
                    'avg_percentage' => $regularAvg,
                    'medication_avg_percentage' => $medicationAvg,
                    'composite_avg_percentage' => $this->computeCompositeScore($regularAvg, $medicationAvg),
                ];
            })
            ->values()
            ->toArray();
    }

    public function getClassificationBreakdown(): array
    {
        return PhcCenter::where('is_active', true)
            ->select('classification')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('classification')
            ->get()
            ->map(function ($row) {
                $centerIds = PhcCenter::where('classification', $row->classification)
                    ->where('is_active', true)
                    ->pluck('id');

                $centersWithRegular = 0;
                $regularSum = 0;
                foreach ($centerIds as $id) {
                    $avg = $this->getRegularAvg($id);
                    if ($avg > 0) {
                        $regularSum += $avg;
                        $centersWithRegular++;
                    }
                }

                $medicationAvg = round((float) (MedicationEvaluation::whereIn('phc_center_id', $centerIds)
                    ->where('status', 'completed')
                    ->avg('percentage') ?? 0), 2);

                $regularAvg = $centersWithRegular > 0
                    ? round($regularSum / $centersWithRegular, 2)
                    : 0;

                return [
                    'classification' => $row->classification,
                    'count' => (int) $row->count,
                    'avg_percentage' => $regularAvg,
                    'medication_avg_percentage' => $medicationAvg,
                    'composite_avg_percentage' => $this->computeCompositeScore($regularAvg, $medicationAvg),
                ];
            })
            ->values()
            ->toArray();
    }

    public function getCompositeScore(?int $phcCenterId = null): array
    {
        if ($phcCenterId) {
            $regularAvg = $this->getRegularAvg($phcCenterId);
            $medicationAvg = $this->getMedicationAvg($phcCenterId);
            $center = PhcCenter::find($phcCenterId);

            return [
                'phc_center_id' => $phcCenterId,
                'phc_center_name' => $center?->name,
                'regular_avg_percentage' => $regularAvg,
                'medication_avg_percentage' => $medicationAvg,
                'composite_avg_percentage' => $this->computeCompositeScore($regularAvg, $medicationAvg),
                'weights' => [
                    'regular' => $this->regularWeight,
                    'medication' => $this->medicationWeight,
                ],
            ];
        }

        $centers = PhcCenter::where('is_active', true)->get();

        return $centers->map(fn ($center) => [
            'id' => $center->id,
            'name' => $center->name,
            'code' => $center->code,
            'regular_avg_percentage' => $this->getRegularAvg($center->id),
            'medication_avg_percentage' => $this->getMedicationAvg($center->id),
            'composite_avg_percentage' => $this->computeCompositeScore(
                $this->getRegularAvg($center->id),
                $this->getMedicationAvg($center->id)
            ),
        ])->values()->toArray();
    }

    public function getRecentActivity(int $limit = 10): array
    {
        $regular = Evaluation::with(['center', 'template', 'evaluator'])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn ($evaluation) => [
                'id' => $evaluation->id,
                'type' => 'regular',
                'template_name' => $evaluation->template?->name,
                'center_name' => $evaluation->center?->name,
                'status' => $evaluation->status,
                'percentage' => $evaluation->percentage ? round((float) $evaluation->percentage, 2) : null,
                'updated_at' => $evaluation->updated_at?->toISOString(),
            ]);

        $medication = MedicationEvaluation::with(['phcCenter', 'template', 'evaluator'])
            ->orderByDesc('updated_at')
            ->limit($limit)
            ->get()
            ->map(fn ($evaluation) => [
                'id' => $evaluation->id,
                'type' => 'medication',
                'template_name' => $evaluation->template?->name,
                'center_name' => $evaluation->phcCenter?->name,
                'status' => $evaluation->status,
                'percentage' => $evaluation->percentage ? round((float) $evaluation->percentage, 2) : null,
                'updated_at' => $evaluation->updated_at?->toISOString(),
            ]);

        return $regular->concat($medication)
            ->sortByDesc('updated_at')
            ->values()
            ->take($limit)
            ->toArray();
    }
}
