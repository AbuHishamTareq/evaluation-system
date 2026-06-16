<?php

namespace App\Features\QuestionSubCategories\Services;

use App\Features\QuestionSubCategories\Repositories\QuestionSubCategoryRepositoryInterface;
use App\Models\QuestionSubCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionSubCategoryService
{
    public function __construct(
        protected QuestionSubCategoryRepositoryInterface $questionSubCategoryRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->questionSubCategoryRepository->getAll($filters);
    }

    public function findById(int $id): ?QuestionSubCategory
    {
        return $this->questionSubCategoryRepository->findById($id);
    }

    public function create(array $data): QuestionSubCategory
    {
        return $this->questionSubCategoryRepository->create($data);
    }

    public function update(int $id, array $data): QuestionSubCategory
    {
        return $this->questionSubCategoryRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->questionSubCategoryRepository->delete($id);
    }

    public function getActive(): Collection
    {
        return $this->questionSubCategoryRepository->getActive();
    }

    public function getByCategory(int $categoryId): Collection
    {
        return $this->questionSubCategoryRepository->getByCategory($categoryId);
    }

    public function hasQuestions(int $id): bool
    {
        return $this->questionSubCategoryRepository->hasQuestions($id);
    }
}
