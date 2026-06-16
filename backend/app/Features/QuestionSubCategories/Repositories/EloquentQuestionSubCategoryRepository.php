<?php

namespace App\Features\QuestionSubCategories\Repositories;

use App\Models\QuestionSubCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentQuestionSubCategoryRepository implements QuestionSubCategoryRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = QuestionSubCategory::query()->with('category')->withCount('questions');

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

        if (isset($filters['question_category_id'])) {
            $query->where('question_category_id', $filters['question_category_id']);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('order', 'asc')->paginate($perPage);
    }

    public function findById(int $id): ?QuestionSubCategory
    {
        return QuestionSubCategory::with('category')->withCount('questions')->find($id);
    }

    public function create(array $data): QuestionSubCategory
    {
        return QuestionSubCategory::create($data);
    }

    public function update(int $id, array $data): QuestionSubCategory
    {
        $subCategory = $this->findById($id);
        if (! $subCategory) {
            throw new \InvalidArgumentException("Question sub-category not found: {$id}");
        }
        $subCategory->update($data);

        return $subCategory->fresh()->load('category')->loadCount('questions');
    }

    public function delete(int $id): bool
    {
        $subCategory = $this->findById($id);
        if (! $subCategory) {
            return false;
        }

        return $subCategory->delete();
    }

    public function getActive(): Collection
    {
        return QuestionSubCategory::where('is_active', true)
            ->with('category')
            ->withCount('questions')
            ->orderBy('order', 'asc')
            ->get();
    }

    public function getByCategory(int $categoryId): Collection
    {
        return QuestionSubCategory::where('question_category_id', $categoryId)
            ->orderBy('order', 'asc')
            ->get();
    }

    public function hasQuestions(int $id): bool
    {
        return QuestionSubCategory::where('id', $id)
            ->whereHas('questions')
            ->exists();
    }
}
