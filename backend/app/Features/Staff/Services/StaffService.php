<?php

namespace App\Features\Staff\Services;

use App\Features\Staff\Repositories\StaffRepositoryInterface;
use App\Models\Staff;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class StaffService
{
    public function __construct(
        protected StaffRepositoryInterface $staffRepository
    ) {}

    public function getAllStaff(array $filters = []): LengthAwarePaginator
    {
        return $this->staffRepository->getAll($filters);
    }

    public function getStaffById(int $id): ?Staff
    {
        return $this->staffRepository->findById($id);
    }

    public function createStaff(array $data): Staff
    {
        return $this->staffRepository->create($data);
    }

    public function updateStaff(int $id, array $data): Staff
    {
        $staff = $this->staffRepository->findById($id);

        if (! $staff) {
            throw new \InvalidArgumentException("Staff not found: {$id}");
        }

        return $this->staffRepository->update($staff, $data);
    }

    public function deleteStaff(int $id): bool
    {
        $staff = $this->staffRepository->findById($id);

        if (! $staff) {
            return false;
        }

        return $this->staffRepository->delete($staff);
    }

    public function toggleActive(int $id, array $data = []): ?Staff
    {
        $staff = $this->staffRepository->findById($id);

        if (! $staff) {
            return null;
        }

        $now = now();

        if ($staff->is_active) {
            // Deactivating — create history record + update snapshot
            $updateData = [
                'is_active' => false,
                'deactivation_reason' => $data['deactivation_reason'] ?? null,
                'deactivation_notes' => $data['deactivation_notes'] ?? null,
            ];

            $staff->deactivations()->create([
                'deactivation_reason' => $data['deactivation_reason'] ?? 'other',
                'deactivation_notes' => $data['deactivation_notes'] ?? null,
                'deactivated_at' => $now,
            ]);
        } else {
            // Reactivating — close the latest open deactivation + clear snapshot
            $updateData = [
                'is_active' => true,
                'deactivation_reason' => null,
                'deactivation_notes' => null,
            ];

            $staff->deactivations()
                ->whereNull('reactivated_at')
                ->latest('deactivated_at')
                ->first()?->update([
                    'reactivated_at' => $now,
                    'reactivation_notes' => $data['reactivation_notes'] ?? null,
                ]);
        }

        $staff->update($updateData);

        return $staff->fresh();
    }

    public function getActiveStaff(): Collection
    {
        return $this->staffRepository->getActive();
    }

    public function searchStaff(string $query): Collection
    {
        return $this->staffRepository->search($query);
    }

    public function syncEducationalDegrees(Staff $staff, array $degrees): void
    {
        $syncData = [];

        foreach ($degrees as $degree) {
            $educationalDegreeId = $degree['educational_degree_id'] ?? null;

            if (! $educationalDegreeId) {
                continue;
            }

            $syncData[$educationalDegreeId] = [
                'institution' => $degree['institution'] ?? null,
                'year_obtained' => $degree['year_obtained'] ?? null,
                'degree_field' => $degree['degree_field'] ?? null,
                'gpa_type' => $degree['gpa_type'] ?? null,
                'gpa_value' => $degree['gpa_value'] ?? null,
            ];
        }

        $staff->educationalDegrees()->sync($syncData);
    }

    public function syncExperiences(Staff $staff, array $experiences): void
    {
        $staff->experiences()->delete();

        foreach ($experiences as $experience) {
            $staff->experiences()->create([
                'company' => $experience['company'] ?? '',
                'position' => $experience['position'] ?? null,
                'from_date' => $experience['from_date'] ?? null,
                'to_date' => $experience['to_date'] ?? null,
                'description' => $experience['description'] ?? null,
                'is_current' => $experience['is_current'] ?? false,
            ]);
        }
    }

    public function syncCertificates(Staff $staff, array $certificates): void
    {
        $staff->certifications()->delete();

        foreach ($certificates as $certificate) {
            $staff->certifications()->create([
                'name' => $certificate['name'] ?? '',
                'issuing_organization' => $certificate['issuing_organization'] ?? null,
                'issue_date' => $certificate['issue_date'] ?? null,
                'expiry_date' => $certificate['expiry_date'] ?? null,
                'credential_id' => $certificate['credential_id'] ?? null,
            ]);
        }
    }
}
