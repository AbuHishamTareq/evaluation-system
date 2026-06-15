<?php

namespace App\Features\Classification\Repositories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentCategoryRepository implements CategoryRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Category::query();

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('code', 'like', "%{$filters['search']}%")
                    ->orWhere('name', 'like', "%{$filters['search']}%")
                    ->orWhere('description', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $isActive = filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('code', 'asc')->paginate($perPage);
    }

    public function findById(int $id): ?Category
    {
        return Category::find($id);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(int $id, array $data): Category
    {
        $category = $this->findById($id);
        if (! $category) {
            throw new \InvalidArgumentException("Category not found: {$id}");
        }
        $category->update($data);

        return $category->fresh();
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
        return Category::where('is_active', true)->orderBy('code', 'asc')->get();
    }

    public function search(string $searchTerm): Collection
    {
        return Category::where(function ($query) use ($searchTerm) {
            $query->where('code', 'like', "%{$searchTerm}%")
                ->orWhere('name', 'like', "%{$searchTerm}%")
                ->orWhere('description', 'like', "%{$searchTerm}%");
        })->get();
    }
}
