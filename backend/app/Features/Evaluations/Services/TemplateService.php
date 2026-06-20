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
            $this->resolveQuestionSources($data);

            $hasQuestions = ! empty($data['questions']);

            $totalScore = $data['total_score'] ?? null;
            if ($totalScore === null && $hasQuestions) {
                $totalScore = array_sum(array_map(function ($q) {
                    return $q['weight'] ?? 1;
                }, $data['questions']));
            }

            $template = EvaluationTemplate::create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'type' => $data['type'] ?? 'standard',
                'schedule_type' => $data['schedule_type'] ?? 'one_time',
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'total_score' => $totalScore ?? 100,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if ($hasQuestions) {
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

            $hadQuestionSources = $this->resolveQuestionSources($data);

            $updateData = [
                'name' => $data['name'] ?? $template->name,
                'description' => $data['description'] ?? $template->description,
                'type' => $data['type'] ?? $template->type,
                'schedule_type' => $data['schedule_type'] ?? $template->schedule_type,
                'start_date' => $data['start_date'] ?? $template->start_date,
                'end_date' => $data['end_date'] ?? $template->end_date,
                'is_active' => $data['is_active'] ?? $template->is_active,
            ];

            if ($hadQuestionSources || isset($data['questions'])) {
                $newQuestions = $data['questions'] ?? [];
                $totalScore = $data['total_score'] ?? null;
                if ($totalScore === null) {
                    $totalScore = array_sum(array_map(function ($q) {
                        return $q['weight'] ?? 1;
                    }, $newQuestions));
                }
                $updateData['total_score'] = $totalScore;

                $template->update($updateData);
                $template->questions()->delete();
                $this->addQuestionsToTemplate($template, $newQuestions);
            } else {
                if (isset($data['total_score'])) {
                    $updateData['total_score'] = $data['total_score'];
                }
                $template->update($updateData);
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

    /**
     * Resolve category_id, sub_category_id, and new_questions sources
     * into the questions array. Removes the temporary fields from $data.
     *
     * @return bool Whether any question source was present.
     */
    private function resolveQuestionSources(array &$data): bool
    {
        $hasSources = false;

        // Create new questions inline and add them to the questions array
        if (! empty($data['new_questions'])) {
            $hasSources = true;
            $createdQuestions = [];

            foreach ($data['new_questions'] as $newQ) {
                $question = Question::create([
                    'category_id' => $data['category_id'] ?? null,
                    'sub_category_id' => $data['sub_category_id'] ?? null,
                    'question_text' => $newQ['question_text'],
                    'description' => $newQ['description'] ?? null,
                    'question_type' => $newQ['question_type'],
                    'options' => isset($newQ['options']) ? json_decode($newQ['options'], true) : null,
                    'weight' => (int) ($newQ['weight'] ?? 1),
                    'max_score' => $newQ['max_score'] ?? null,
                    'is_required' => (bool) ($newQ['is_required'] ?? false),
                    'is_active' => true,
                ]);

                $createdQuestions[] = [
                    'question_id' => $question->id,
                    'weight' => (int) ($newQ['weight'] ?? 1),
                ];
            }

            $data['questions'] = array_merge($data['questions'] ?? [], $createdQuestions);
        }

        // Auto-populate from category questions
        if (! empty($data['category_id'])) {
            $hasSources = true;
            $categoryQuestions = Question::where('category_id', $data['category_id'])
                ->where('is_active', true)
                ->get()
                ->map(fn (Question $q) => ['question_id' => $q->id, 'weight' => 1])
                ->toArray();

            if (! empty($categoryQuestions)) {
                $data['questions'] = array_merge($data['questions'] ?? [], $categoryQuestions);
            }
        }

        // Auto-populate from sub-category questions
        if (! empty($data['sub_category_id'])) {
            $hasSources = true;
            $subCategoryQuestions = Question::where('sub_category_id', $data['sub_category_id'])
                ->where('is_active', true)
                ->get()
                ->map(fn (Question $q) => ['question_id' => $q->id, 'weight' => 1])
                ->toArray();

            if (! empty($subCategoryQuestions)) {
                $data['questions'] = array_merge($data['questions'] ?? [], $subCategoryQuestions);
            }
        }

        // Remove temporary fields so they are not passed to model creation
        unset($data['category_id'], $data['sub_category_id'], $data['new_questions']);

        return $hasSources;
    }

    public function addQuestionsToTemplate(EvaluationTemplate $template, array $questions): Collection
    {
        $added = collect();

        foreach ($questions as $index => $questionData) {
            $questionId = is_array($questionData) ? $questionData['question_id'] : $questionData;
            $weight = is_array($questionData) ? ($questionData['weight'] ?? 1) : 1;
            $order = is_array($questionData) && isset($questionData['order'])
                ? (int) $questionData['order']
                : $index + 1;

            $question = Question::find($questionId);
            if (! $question) {
                continue;
            }

            $templateQuestion = EvaluationTemplateQuestion::create([
                'template_id' => $template->id,
                'question_id' => $questionId,
                'order' => $order,
                'weight' => $weight,
                'is_medication_check' => is_array($questionData)
                    ? ($questionData['is_medication_check'] ?? false)
                    : false,
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
