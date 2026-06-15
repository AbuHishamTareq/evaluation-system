<?php

namespace App\Features\Classification\Services;

use App\Features\Classification\Repositories\FieldRepositoryInterface;
use App\Models\Field;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class FieldService
{
    public function __construct(
        protected FieldRepositoryInterface $fieldRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->fieldRepository->getAll($filters);
    }

    public function findById(int $id): ?Field
    {
        return $this->fieldRepository->findById($id);
    }

    public function create(array $data): Field
    {
        return $this->fieldRepository->create($data);
    }

    public function update(int $id, array $data): Field
    {
        return $this->fieldRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->fieldRepository->delete($id);
    }

    public function getActive(): Collection
    {
        return $this->fieldRepository->getActive();
    }

    public function search(string $searchTerm): Collection
    {
        return $this->fieldRepository->search($searchTerm);
    }
}
