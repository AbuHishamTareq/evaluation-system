<?php

namespace App\Features\MedicationEvaluations\Services;

use App\Features\MedicationEvaluations\Repositories\MedicationEvaluationRepositoryInterface;
use App\Models\MedicationEvaluation;
use App\Models\MedicationEvaluationAnswer;
use App\Models\MedicationEvaluationTemplate;
use Illuminate\Pagination\LengthAwarePaginator;

class MedicationEvaluationService
{
    public function __construct(
        protected MedicationEvaluationRepositoryInterface $evaluationRepository
    ) {}

    public function getAll(array $filters): LengthAwarePaginator
    {
        return $this->evaluationRepository->getAll($filters);
    }

    public function getById(int $id): ?MedicationEvaluation
    {
        return $this->evaluationRepository->findById($id);
    }

    public function create(array $data): MedicationEvaluation
    {
        $template = MedicationEvaluationTemplate::with('medications')->findOrFail($data['template_id']);

        $evaluation = $this->evaluationRepository->create([
            'template_id' => $data['template_id'],
            'phc_center_id' => $data['phc_center_id'],
            'evaluator_id' => $data['evaluator_id'],
            'status' => 'draft',
            'started_at' => now(),
        ]);

        return $this->getById($evaluation->id);
    }

    public function update(int $id, array $data): MedicationEvaluation
    {
        $evaluation = $this->evaluationRepository->findById($id);

        $updateData = [];

        if (isset($data['status'])) {
            $updateData['status'] = $data['status'];

            if ($data['status'] === 'completed' && ! $evaluation->completed_at) {
                $updateData['completed_at'] = now();
            }
        }

        if (array_key_exists('notes', $data)) {
            $updateData['notes'] = $data['notes'];
        }

        if (! empty($updateData)) {
            $this->evaluationRepository->update($id, $updateData);
        }

        if (isset($data['answers'])) {
            // Delete old answers
            $evaluation->answers()->delete();

            $template = $evaluation->template;

            // totalMaxScore = ALL medications × ALL criteria weights (matches frontend computeMaxScore)
            $medicationCount = $template->medications->count();
            $criteriaWeightSum = $template->criteria->sum('weight');
            $totalMaxScore = $medicationCount * $criteriaWeightSum;

            $totalScore = 0;

            foreach ($data['answers'] as $answerData) {
                $criterion = $template->criteria->firstWhere('id', $answerData['criterion_id']);

                $templateMedication = $template->medications->firstWhere('id', $answerData['template_medication_id']);

                if (! $criterion || ! $templateMedication) {
                    continue;
                }

                $score = $this->calculateScore(
                    $answerData['answer_value'] ?? null,
                    $criterion->type,
                    $criterion->weight,
                    $templateMedication->recommended_quantity
                );

                MedicationEvaluationAnswer::create([
                    'evaluation_id' => $evaluation->id,
                    'template_medication_id' => $answerData['template_medication_id'],
                    'criterion_id' => $answerData['criterion_id'],
                    'answer_value' => $answerData['answer_value'] ?? null,
                    'score' => $score,
                    'max_score' => (float) $criterion->weight,
                    'comment' => $answerData['comment'] ?? null,
                ]);

                $totalScore += $score;
            }

            $percentage = $totalMaxScore > 0 ? round(($totalScore / $totalMaxScore) * 100, 2) : 0;

            $this->evaluationRepository->update($id, [
                'total_score' => $totalScore,
                'max_score' => $totalMaxScore,
                'percentage' => $percentage,
            ]);
        }

        return $this->getById($evaluation->id);
    }

    public function delete(int $id): void
    {
        $this->evaluationRepository->delete($id);
    }

    private function calculateScore(?string $answerValue, string $criterionType, float $weight, float $recommendedQuantity): float
    {
        if ($answerValue === null || $answerValue === '') {
            return 0;
        }

        return match ($criterionType) {
            'number' => $this->calculateNumberScore($answerValue, $weight, $recommendedQuantity),
            'yes_no' => $answerValue === 'yes' ? $weight : 0,
            'yes_no_partial' => match ($answerValue) {
                'yes' => $weight,
                'partial' => $weight / 2,
                default => 0,
            },
            'text' => trim($answerValue ?? '') !== '' ? $weight : 0,
            default => 0,
        };
    }

    private function calculateNumberScore(string $answerValue, float $weight, float $recommendedQuantity): float
    {
        if (! is_numeric($answerValue)) {
            return 0;
        }

        $value = (float) $answerValue;
        $ratio = $value / max(1, $recommendedQuantity);

        return min($ratio, 1) * $weight;
    }
}
