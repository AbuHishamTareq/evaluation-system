<?php

namespace App\Features\Zones\Repositories;

use App\Models\Zone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ZoneRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findById(int $id): ?Zone;

    public function findByCode(string $code): ?Zone;

    public function create(array $data): Zone;

    public function update(int $id, array $data): Zone;

    public function delete(int $id): bool;

    public function getRootZones(): Collection;

    public function getChildren(int $parentId): Collection;

    public function getTree(): Collection;

    public function search(string $searchTerm): Collection;

    public function getByLevel(string $level): Collection;
}
