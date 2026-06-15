<?php

namespace App\Features\TeamCodes\Services;

use App\Features\TeamCodes\Repositories\TeamCodeRepositoryInterface;
use App\Models\Evaluation;
use App\Models\TeamCode;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TeamCodeService
{
    public function __construct(
        protected TeamCodeRepositoryInterface $teamCodeRepository
    ) {}

    public function getAllTeamCodes(array $filters = []): LengthAwarePaginator
    {
        return $this->teamCodeRepository->getAll($filters);
    }

    public function getTeamCodeById(int $id): ?TeamCode
    {
        return $this->teamCodeRepository->findById($id);
    }

    public function getTeamCodeByCode(string $code): ?TeamCode
    {
        return $this->teamCodeRepository->findByCode($code);
    }

    public function createTeamCode(array $data): TeamCode
    {
        return $this->teamCodeRepository->create($data);
    }

    public function updateTeamCode(int $id, array $data): TeamCode
    {
        return $this->teamCodeRepository->update($id, $data);
    }

    public function deleteTeamCode(int $id): bool
    {
        return $this->teamCodeRepository->delete($id);
    }

    public function getActiveTeamCodes(): Collection
    {
        return $this->teamCodeRepository->getActive();
    }

    public function searchTeamCodes(string $searchTerm): Collection
    {
        return $this->teamCodeRepository->search($searchTerm);
    }

    public function getTeamCodeStatistics(int $teamCodeId): array
    {
        $teamCode = $this->getTeamCodeById($teamCodeId);

        if (! $teamCode) {
            return [];
        }

        $staffCount = $teamCode->staff()->count();
        $evaluationsCount = Evaluation::whereHas('staff', function ($query) use ($teamCodeId) {
            $query->where('team_code_id', $teamCodeId);
        })->count();

        return [
            'team_code' => $teamCode,
            'staff_count' => $staffCount,
            'evaluations_count' => $evaluationsCount,
        ];
    }
}
