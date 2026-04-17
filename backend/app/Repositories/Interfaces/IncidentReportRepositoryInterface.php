<?php

namespace App\Repositories\Interfaces;

use App\Models\IncidentReport;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface IncidentReportRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function getById(int $id): ?IncidentReport;

    public function create(array $data): IncidentReport;

    public function update(IncidentReport $report, array $data): IncidentReport;

    public function delete(IncidentReport $report): bool;

    public function getByStatus(string $status): Collection;

    public function getBySeverity(string $severity): Collection;

    public function getHighSeverity(): Collection;
}
