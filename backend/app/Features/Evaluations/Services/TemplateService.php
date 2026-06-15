<?php

namespace App\Features\Evaluations\Services;

use App\Models\EvaluationTemplate;
use App\Models\EvaluationTemplateQuestion;
use App\Models\Question;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TemplateService
{
    public function getAllTemplates(array $filters = []): LengthAwarePaginator
    {
        $query = EvaluationTemplate::query()->with(['questions.question.category']);

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['schedule_type'])) {
            $query->where('schedule_type', $filters['schedule_type']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getTemplateById(int $id): ?EvaluationTemplate
    {
        return EvaluationTemplate::with(['questions.question.category'])->find($id);
    }

    public function createTemplate(array $data): EvaluationTemplate
    {
        return DB::transaction(function () use ($data) {
            $template = EvaluationTemplate::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'schedule_type' => $data['schedule_type'] ?? 'one_time',
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'total_score' => $data['total_score'] ?? 100,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['questions'])) {
                $this->addQuestionsToTemplate($template, $data['questions']);
            }

            return $template->fresh(['questions.question.category']);
        });
    }

    public function updateTemplate(int $id, array $data): EvaluationTemplate
    {
        return DB::transaction(function () use ($id, $data) {
            $template = $this->getTemplateById($id);
            if (! $template) {
                throw new \InvalidArgumentException("Template not found: {$id}");
            }

            $template->update([
                'name' => $data['name'] ?? $template->name,
                'description' => $data['description'] ?? $template->description,
                'schedule_type' => $data['schedule_type'] ?? $template->schedule_type,
                'start_date' => $data['start_date'] ?? $template->start_date,
                'end_date' => $data['end_date'] ?? $template->end_date,
                'total_score' => $data['total_score'] ?? $template->total_score,
                'is_active' => $data['is_active'] ?? $template->is_active,
            ]);

            if (isset($data['questions'])) {
                $template->questions()->delete();
                $this->addQuestionsToTemplate($template, $data['questions']);
            }

            return $template->fresh(['questions.question.category']);
        });
    }

    public function deleteTemplate(int $id): bool
    {
        $template = $this->getTemplateById($id);
        if (! $template) {
            return false;
        }

        return $template->delete();
    }

    public function toggleStatus(int $id): EvaluationTemplate
    {
        $template = $this->getTemplateById($id);
        if (! $template) {
            throw new \InvalidArgumentException("Template not found: {$id}");
        }

        $template->update(['is_active' => ! $template->is_active]);

        return $template->fresh();
    }

    public function addQuestionsToTemplate(EvaluationTemplate $template, array $questions): Collection
    {
        $added = collect();

        foreach ($questions as $index => $questionData) {
            $questionId = is_array($questionData) ? $questionData['question_id'] : $questionData;
            $weight = is_array($questionData) ? ($questionData['weight'] ?? 1) : 1;

            $question = Question::find($questionId);
            if (! $question) {
                continue;
            }

            $templateQuestion = EvaluationTemplateQuestion::create([
                'template_id' => $template->id,
                'question_id' => $questionId,
                'order' => $index + 1,
                'weight' => $weight,
            ]);

            $added->push($templateQuestion);
        }

        return $added;
    }

    public function removeQuestionFromTemplate(int $templateId, int $questionId): bool
    {
        return EvaluationTemplateQuestion::where('template_id', $templateId)
            ->where('question_id', $questionId)
            ->delete() > 0;
    }

    public function getActiveTemplates(): Collection
    {
        return EvaluationTemplate::where('is_active', true)
            ->with(['questions.question'])
            ->get();
    }
}
