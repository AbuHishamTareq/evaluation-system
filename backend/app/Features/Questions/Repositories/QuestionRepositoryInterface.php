<?php

namespace App\Features\Questions\Repositories;

use App\Models\Question;
use Illuminate\Pagination\LengthAwarePaginator;

interface QuestionRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Question;

    public function create(array $data): Question;

    public function update(int $id, array $data): Question;

    public function delete(int $id): bool;

    public function getByCategory(int $categoryId): LengthAwarePaginator;

    public function getByType(string $type): LengthAwarePaginator;
}
