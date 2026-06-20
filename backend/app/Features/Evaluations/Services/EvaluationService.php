<?php

namespace App\Features\Evaluations\Services;

use App\Features\Evaluations\Repositories\EvaluationRepositoryInterface;
use App\Models\Evaluation;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class EvaluationService
{
    public function __construct(
        protected EvaluationRepositoryInterface $evaluationRepository,
        protected ScoringService $scoringService
    ) {}

    public function getAllEvaluations(array $filters = []): LengthAwarePaginator
    {
        return $this->evaluationRepository->getAll($filters);
    }

    public function getEvaluationById(int $id): ?Evaluation
    {
        return $this->evaluationRepository->findById($id);
    }

    public function createEvaluation(array $data): Evaluation
    {
        return DB::transaction(function () use ($data) {
            $evaluation = $this->evaluationRepository->create([
                'template_id' => $data['template_id'],
                'phc_center_id' => $data['phc_center_id'],
                'staff_id' => $data['staff_id'] ?? null,
                'evaluator_id' => $data['evaluator_id'],
                'status' => $data['status'] ?? 'draft',
                'notes' => $data['notes'] ?? null,
                'started_at' => now(),
            ]);

            return $evaluation->fresh(['template.questions.question', 'center', 'staff', 'evaluator']);
        });
    }

    public function updateEvaluation(int $id, array $data): Evaluation
    {
        return DB::transaction(function () use ($id, $data) {
            $updateData = array_intersect_key($data, array_flip([
                'template_id', 'phc_center_id', 'staff_id', 'evaluator_id', 'status', 'notes',
            ]));

            $evaluation = $this->evaluationRepository->update($id, $updateData);

            if (isset($data['answers'])) {
                $evaluation->answers()->delete();

                foreach ($data['answers'] as $answer) {
                    $question = $evaluation->template->questions->firstWhere('question_id', $answer['question_id']);
                    $weight = $question ? $question->weight : 1;

                    $scoreData = $this->scoringService->calculateAnswerScoreFromInput($answer, $question?->question);

                    $evaluation->answers()->create([
                        'question_id' => $answer['question_id'],
                        'medication_id' => $answer['medication_id'] ?? null,
                        'answer_text' => $answer['answer_text'] ?? null,
                        'answer_yes_no' => $answer['answer_yes_no'] ?? null,
                        'answer_rating' => $answer['answer_rating'] ?? null,
                        'answer_multiple_choice' => $answer['answer_multiple_choice'] ?? null,
                        'comment' => $answer['comment'] ?? null,
                        'score' => $scoreData['score'],
                        'max_score' => $scoreData['max_score'],
                    ]);
                }

                $scores = $this->scoringService->calculateScore($evaluation);
                $evaluation->update([
                    'total_score' => $scores['total'],
                    'max_score' => $scores['max'],
                    'percentage' => $scores['percentage'],
                ]);
            }

            return $evaluation->fresh(['template.questions.question', 'center', 'staff', 'evaluator', 'answers.question']);
        });
    }

    public function deleteEvaluation(int $id): bool
    {
        return $this->evaluationRepository->delete($id);
    }

    public function getEvaluationsByStaff(int $staffId): LengthAwarePaginator
    {
        return $this->evaluationRepository->getByStaff($staffId);
    }

    public function getEvaluationsByEvaluator(int $evaluatorId): LengthAwarePaginator
    {
        return $this->evaluationRepository->getByEvaluator($evaluatorId);
    }

    public function getEvaluationsByPeriod(string $startDate, string $endDate): LengthAwarePaginator
    {
        return $this->evaluationRepository->getByPeriod($startDate, $endDate);
    }

    public function submitEvaluation(int $id): Evaluation
    {
        $evaluation = $this->getEvaluationById($id);

        if (! $evaluation) {
            throw new \RuntimeException('Evaluation not found');
        }

        if (! in_array($evaluation->status, ['draft', 'in_progress'])) {
            throw new \RuntimeException('Only draft or in-progress evaluations can be submitted');
        }

        $scores = $this->scoringService->calculateScore($evaluation);

        $evaluation->update([
            'status' => 'completed',
            'completed_at' => now(),
            'total_score' => $scores['total'],
            'max_score' => $scores['max'],
            'percentage' => $scores['percentage'],
        ]);

        return $evaluation->fresh();
    }

    public function approveEvaluation(int $id): Evaluation
    {
        $evaluation = $this->getEvaluationById($id);

        if (! $evaluation) {
            throw new \RuntimeException('Evaluation not found');
        }

        if ($evaluation->status !== 'completed') {
            throw new \RuntimeException('Only completed evaluations can be approved');
        }

        $evaluation->update([
            'status' => 'archived',
        ]);

        return $evaluation->fresh();
    }
}
