<?php

namespace App\Features\QuestionSubCategories\Repositories;

use App\Models\QuestionSubCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface QuestionSubCategoryRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?QuestionSubCategory;

    public function create(array $data): QuestionSubCategory;

    public function update(int $id, array $data): QuestionSubCategory;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function getByCategory(int $categoryId): Collection;

    public function hasQuestions(int $id): bool;
}
