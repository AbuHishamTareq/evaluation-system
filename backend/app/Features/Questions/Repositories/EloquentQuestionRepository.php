<?php

namespace App\Features\Questions\Repositories;

use App\Models\Question;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentQuestionRepository implements QuestionRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Question::query()->with(['category']);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('question_text', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['type'])) {
            $query->where('question_type', $filters['type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Question
    {
        return Question::with(['category'])->find($id);
    }

    public function create(array $data): Question
    {
        return Question::create($data);
    }

    public function update(int $id, array $data): Question
    {
        $question = $this->findById($id);
        $question->update($data);

        return $question->fresh();
    }

    public function delete(int $id): bool
    {
        $question = $this->findById($id);

        if (! $question) {
            return false;
        }

        return $question->delete();
    }

    public function getByCategory(int $categoryId): LengthAwarePaginator
    {
        return Question::with(['category'])
            ->where('category_id', $categoryId)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function getByType(string $type): LengthAwarePaginator
    {
        return Question::with(['category'])
            ->where('question_type', $type)
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }
}
