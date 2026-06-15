<?php

namespace App\Features\Classification\Services;

use App\Features\Classification\Repositories\RankRepositoryInterface;
use App\Models\Rank;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class RankService
{
    public function __construct(
        protected RankRepositoryInterface $rankRepository
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->rankRepository->getAll($filters);
    }

    public function findById(int $id): ?Rank
    {
        return $this->rankRepository->findById($id);
    }

    public function create(array $data): Rank
    {
        return $this->rankRepository->create($data);
    }

    public function update(int $id, array $data): Rank
    {
        return $this->rankRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->rankRepository->delete($id);
    }

    public function getActive(): Collection
    {
        return $this->rankRepository->getActive();
    }

    public function search(string $searchTerm): Collection
    {
        return $this->rankRepository->search($searchTerm);
    }
}
