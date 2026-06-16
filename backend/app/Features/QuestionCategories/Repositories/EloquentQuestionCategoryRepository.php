<?php

namespace App\Features\QuestionCategories\Repositories;

use App\Models\QuestionCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentQuestionCategoryRepository implements QuestionCategoryRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = QuestionCategory::query()->withCount(['questions', 'subCategories']);

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $isActive = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('order', 'asc')->paginate($perPage);
    }

    public function findById(int $id): ?QuestionCategory
    {
        return QuestionCategory::withCount(['questions', 'subCategories'])->find($id);
    }

    public function create(array $data): QuestionCategory
    {
        return QuestionCategory::create($data);
    }

    public function update(int $id, array $data): QuestionCategory
    {
        $category = $this->findById($id);
        if (! $category) {
            throw new \InvalidArgumentException("Question category not found: {$id}");
        }
        $category->update($data);

        return $category->fresh()->loadCount(['questions', 'subCategories']);
    }

    public function delete(int $id): bool
    {
        $category = $this->findById($id);
        if (! $category) {
            return false;
        }

        return $category->delete();
    }

    public function getActive(): Collection
    {
        return QuestionCategory::where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();
    }

    public function hasQuestions(int $id): bool
    {
        return QuestionCategory::where('id', $id)
            ->whereHas('questions')
            ->exists();
    }
}
