<?php

namespace App\Features\QuestionCategories\Services;

use App\Features\QuestionCategories\Repositories\QuestionCategoryRepositoryInterface;
use App\Models\QuestionCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class QuestionCategoryService
{
    public function __construct(
        protected QuestionCategoryRepositoryInterface $questionCategoryRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->questionCategoryRepository->getAll($filters);
    }

    public function findById(int $id): ?QuestionCategory
    {
        return $this->questionCategoryRepository->findById($id);
    }

    public function create(array $data): QuestionCategory
    {
        return $this->questionCategoryRepository->create($data);
    }

    public function update(int $id, array $data): QuestionCategory
    {
        return $this->questionCategoryRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->questionCategoryRepository->delete($id);
    }

    public function getActive(): Collection
    {
        return $this->questionCategoryRepository->getActive();
    }

    public function hasQuestions(int $id): bool
    {
        return $this->questionCategoryRepository->hasQuestions($id);
    }
}
