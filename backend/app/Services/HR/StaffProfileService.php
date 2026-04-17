<?php

namespace App\Services\HR;

use App\Models\StaffProfile;
use App\Repositories\Interfaces\StaffProfileRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class StaffProfileService
{
    public function __construct(
        protected StaffProfileRepositoryInterface $repository,
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->repository->getAll($filters);
    }

    public function getById(int $id): ?StaffProfile
    {
        return $this->repository->getById($id);
    }

    public function getByUserId(int $userId): ?StaffProfile
    {
        return $this->repository->getByUserId($userId);
    }

    public function create(array $data): StaffProfile
    {
        return $this->repository->create($data);
    }

    public function update(StaffProfile $profile, array $data): StaffProfile
    {
        return $this->repository->update($profile, $data);
    }

    public function delete(StaffProfile $profile): bool
    {
        return $this->repository->delete($profile);
    }

    public function search(string $query): Collection
    {
        return $this->repository->search($query);
    }

    public function getActive(): Collection
    {
        return $this->repository->getActive();
    }

    public function getAlerts(int $days = 30): array
    {
        $staff = $this->repository->getActive();

        return $staff->map(function ($profile) use ($days) {
            $alerts = [];

            if ($profile->hasExpiringLicense($days)) {
                $alerts[] = [
                    'type' => 'license_expiry',
                    'severity' => 'high',
                    'message' => 'SCFHS license expiring within '.$days.' days',
                    'expiry_date' => $profile->scfhs_license_expiry?->toDateString(),
                ];
            }

            if ($profile->hasExpiringInsurance($days)) {
                $alerts[] = [
                    'type' => 'insurance_expiry',
                    'severity' => 'high',
                    'message' => 'Malpractice insurance expiring within '.$days.' days',
                    'expiry_date' => $profile->malpractice_expiry?->toDateString(),
                ];
            }

            return [
                'staff_profile_id' => $profile->id,
                'name' => $profile->full_name,
                'alerts' => $alerts,
            ];
        })->filter(fn ($item) => count($item['alerts']) > 0)->values()->all();
    }
}
