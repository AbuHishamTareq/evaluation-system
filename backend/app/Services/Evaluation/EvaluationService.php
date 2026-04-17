<?php

namespace App\Services\Evaluation;

use App\Models\ActionPlan;
use App\Models\Evaluation;
use App\Models\EvaluationQuestion;
use App\Models\EvaluationResponse;
use App\Models\EvaluationTemplate;
use Illuminate\Pagination\LengthAwarePaginator;

class EvaluationService
{
    public function getAllTemplates(array $filters = []): LengthAwarePaginator
    {
        $query = EvaluationTemplate::query();

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    public function getTemplateById(int $id): ?EvaluationTemplate
    {
        return EvaluationTemplate::with('questions')->find($id);
    }

    public function createTemplate(array $data): EvaluationTemplate
    {
        return EvaluationTemplate::create($data);
    }

    public function updateTemplate(EvaluationTemplate $template, array $data): EvaluationTemplate
    {
        $template->update($data);

        return $template;
    }

    public function addQuestion(EvaluationTemplate $template, array $data): EvaluationQuestion
    {
        $data['template_id'] = $template->id;

        $maxOrder = $template->questions()->max('order') ?? 0;
        $data['order'] = $data['order'] ?? $maxOrder + 1;

        return EvaluationQuestion::create($data);
    }

    public function updateQuestion(EvaluationQuestion $question, array $data): EvaluationQuestion
    {
        $question->update($data);

        return $question;
    }

    public function deleteQuestion(EvaluationQuestion $question): bool
    {
        return $question->delete();
    }

    public function importQuestions(EvaluationTemplate $template, array $questions): int
    {
        $count = 0;
        $order = $template->questions()->max('order') ?? 0;

        foreach ($questions as $questionData) {
            $order++;
            $questionData['template_id'] = $template->id;
            $questionData['order'] = $questionData['order'] ?? $order;

            EvaluationQuestion::create($questionData);
            $count++;
        }

        return $count;
    }

    public function getAllEvaluations(array $filters = []): LengthAwarePaginator
    {
        $query = Evaluation::with(['template', 'staffProfile', 'evaluator']);

        if (! empty($filters['template_id'])) {
            $query->where('template_id', $filters['template_id']);
        }

        if (! empty($filters['staff_profile_id'])) {
            $query->where('staff_profile_id', $filters['staff_profile_id']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);
    }

    public function createEvaluation(array $data): Evaluation
    {
        $template = EvaluationTemplate::findOrFail($data['template_id']);
        $data['max_score'] = $template->questions()->sum('score') ?? 100;

        return Evaluation::create($data);
    }

    public function submitResponse(Evaluation $evaluation, array $data): EvaluationResponse
    {
        $response = EvaluationResponse::create([
            'evaluation_id' => $evaluation->id,
            'question_id' => $data['question_id'],
            'staff_profile_id' => $evaluation->staff_profile_id,
            'answer' => $data['answer'],
            'score' => $data['score'] ?? 0,
            'notes' => $data['notes'] ?? null,
        ]);

        $this->recalculateEvaluation($evaluation);

        return $response;
    }

    public function completeEvaluation(Evaluation $evaluation): void
    {
        $evaluation->status = Evaluation::STATUS_COMPLETED;
        $evaluation->completed_at = now();
        $evaluation->calculatePercentage();
        $evaluation->save();

        if ($evaluation->percentage < 70) {
            $this->generateActionPlan($evaluation);
        }
    }

    protected function recalculateEvaluation(Evaluation $evaluation): void
    {
        $totalScore = $evaluation->responses()->sum('score');
        $maxScore = $evaluation->responses()->with('question')->get()->sum('question.score');

        $evaluation->total_score = $totalScore;
        $evaluation->max_score = $maxScore ?: 100;
        $evaluation->calculatePercentage();
        $evaluation->save();
    }

    protected function generateActionPlan(Evaluation $evaluation): void
    {
        ActionPlan::create([
            'evaluation_id' => $evaluation->id,
            'staff_profile_id' => $evaluation->staff_profile_id,
            'title' => 'Performance Improvement Plan',
            'description' => 'Auto-generated due to evaluation score below 70%',
            'status' => ActionPlan::STATUS_PENDING,
            'due_date' => now()->addDays(30),
        ]);
    }

    public function getDashboard(): array
    {
        return [
            'total_evaluations' => Evaluation::count(),
            'completed' => Evaluation::where('status', Evaluation::STATUS_COMPLETED)->count(),
            'pending' => Evaluation::where('status', Evaluation::STATUS_PENDING)->count(),
            'average_score' => Evaluation::where('status', Evaluation::STATUS_COMPLETED)->avg('percentage') ?? 0,
        ];
    }
}
