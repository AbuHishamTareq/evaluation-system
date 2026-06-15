<?php

namespace App\Features\Centers\Repositories;

use App\Models\PhcCenter;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface CenterRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?PhcCenter;

    public function findByCode(string $code): ?PhcCenter;

    public function create(array $data): PhcCenter;

    public function update(int $id, array $data): PhcCenter;

    public function delete(int $id): bool;

    public function getActive(?int $zoneId = null): Collection;

    public function search(string $searchTerm): Collection;

    public function getByZone(int $zoneId): Collection;

    public function getByClassification(string $classification): Collection;
}
