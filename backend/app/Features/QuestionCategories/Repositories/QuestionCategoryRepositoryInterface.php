<?php

namespace App\Features\QuestionCategories\Repositories;

use App\Models\QuestionCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface QuestionCategoryRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?QuestionCategory;

    public function create(array $data): QuestionCategory;

    public function update(int $id, array $data): QuestionCategory;

    public function delete(int $id): bool;

    public function getActive(): Collection;

    public function hasQuestions(int $id): bool;
}
