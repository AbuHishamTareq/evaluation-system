<?php

namespace App\Features\Classification\Services;

use App\Features\Classification\Repositories\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->categoryRepository->getAll($filters);
    }

    public function findById(int $id): ?Category
    {
        return $this->categoryRepository->findById($id);
    }

    public function create(array $data): Category
    {
        return $this->categoryRepository->create($data);
    }

    public function update(int $id, array $data): Category
    {
        return $this->categoryRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->categoryRepository->delete($id);
    }

    public function getActive(): Collection
    {
        return $this->categoryRepository->getActive();
    }

    public function search(string $searchTerm): Collection
    {
        return $this->categoryRepository->search($searchTerm);
    }
}
