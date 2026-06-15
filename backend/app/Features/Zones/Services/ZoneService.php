<?php

namespace App\Features\Zones\Services;

use App\Features\Zones\Repositories\ZoneRepositoryInterface;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ZoneService
{
    public function __construct(
        protected ZoneRepositoryInterface $zoneRepository
    ) {}

    public function getAllZones(array $filters = []): LengthAwarePaginator
    {
        return $this->zoneRepository->getAll($filters);
    }

    public function getZoneById(int $id): ?Zone
    {
        return $this->zoneRepository->findById($id);
    }

    public function getZoneByCode(string $code): ?Zone
    {
        return $this->zoneRepository->findByCode($code);
    }

    public function createZone(array $data): Zone
    {
        return $this->zoneRepository->create($data);
    }

    public function updateZone(int $id, array $data): Zone
    {
        return $this->zoneRepository->update($id, $data);
    }

    public function deleteZone(int $id): bool
    {
        return $this->zoneRepository->delete($id);
    }

    public function getRootZones(): Collection
    {
        return $this->zoneRepository->getRootZones();
    }

    public function getChildren(int $parentId): Collection
    {
        return $this->zoneRepository->getChildren($parentId);
    }

    public function getZoneTree(): Collection
    {
        return $this->zoneRepository->getTree();
    }

    public function getZonesByLevel(string $level): Collection
    {
        return $this->zoneRepository->getByLevel($level);
    }

    public function searchZones(string $searchTerm): Collection
    {
        return $this->zoneRepository->search($searchTerm);
    }

    public function getZoneHierarchy(int $id): array
    {
        $zone = $this->getZoneById($id);

        if (! $zone) {
            return [];
        }

        return $zone->hierarchy;
    }

    public function getZonesWithCenters(int $id): ?Zone
    {
        return $this->zoneRepository->findById($id);
    }
}
