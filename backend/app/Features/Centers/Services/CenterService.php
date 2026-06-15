<?php

namespace App\Features\Centers\Services;

use App\Features\Centers\Repositories\CenterRepositoryInterface;
use App\Models\Evaluation;
use App\Models\PhcCenter;
use App\Models\Zone;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CenterService
{
    public function __construct(
        protected CenterRepositoryInterface $centerRepository
    ) {}

    public function getAllCenters(array $filters = []): LengthAwarePaginator
    {
        return $this->centerRepository->getAll($filters);
    }

    public function getCenterById(int $id): ?PhcCenter
    {
        return $this->centerRepository->findById($id);
    }

    public function getCenterByCode(string $code): ?PhcCenter
    {
        return $this->centerRepository->findByCode($code);
    }

    public function createCenter(array $data): PhcCenter
    {
        if (! isset($data['is_active'])) {
            $data['is_active'] = true;
        }

        return $this->centerRepository->create($data);
    }

    public function updateCenter(int $id, array $data): PhcCenter
    {
        return $this->centerRepository->update($id, $data);
    }

    public function deleteCenter(int $id): bool
    {
        return $this->centerRepository->delete($id);
    }

    public function getActiveCenters(?int $zoneId = null): Collection
    {
        return $this->centerRepository->getActive($zoneId);
    }

    public function searchCenters(string $searchTerm): Collection
    {
        return $this->centerRepository->search($searchTerm);
    }

    public function getCenterStatistics(int $centerId): array
    {
        $center = $this->getCenterById($centerId);

        if (! $center) {
            return [];
        }

        $staffCount = $center->staff()->count();
        $evaluationsCount = Evaluation::whereHas('staff', function ($query) use ($centerId) {
            $query->where('center_id', $centerId);
        })->count();

        return [
            'center' => $center,
            'staff_count' => $staffCount,
            'evaluations_count' => $evaluationsCount,
        ];
    }

    public function getCentersByZone(int $zoneId): Collection
    {
        return $this->centerRepository->getByZone($zoneId);
    }

    public function getCentersByClassification(string $classification): Collection
    {
        return $this->centerRepository->getByClassification($classification);
    }

    public function findZoneByName(string $zoneName): ?Zone
    {
        return Zone::where('name', 'like', "%{$zoneName}%")->first();
    }
}
