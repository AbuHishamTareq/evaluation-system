<?php

namespace App\Services\HR;

use App\Models\IncidentReport;
use App\Repositories\Interfaces\IncidentReportRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class IncidentReportService
{
    public function __construct(
        protected IncidentReportRepositoryInterface $repository,
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return $this->repository->getAll($filters);
    }

    public function getById(int $id): ?IncidentReport
    {
        return $this->repository->getById($id);
    }

    public function create(array $data): IncidentReport
    {
        if (empty($data['severity'])) {
            $data['severity'] = IncidentReport::SEVERITY_MEDIUM;
        }

        if (empty($data['status'])) {
            $data['status'] = IncidentReport::STATUS_OPEN;
        }

        $report = $this->repository->create($data);

        if ($report->isHighSeverity()) {
            $this->notifyHighSeverity($report);
        }

        return $report;
    }

    public function update(IncidentReport $report, array $data): IncidentReport
    {
        return $this->repository->update($report, $data);
    }

    public function delete(IncidentReport $report): bool
    {
        return $this->repository->delete($report);
    }

    public function getDashboard(): array
    {
        $open = $this->repository->getByStatus(IncidentReport::STATUS_OPEN);
        $investigating = $this->repository->getByStatus(IncidentReport::STATUS_INVESTIGATING);
        $actionPlan = $this->repository->getByStatus(IncidentReport::STATUS_ACTION_PLAN);
        $resolved = $this->repository->getByStatus(IncidentReport::STATUS_RESOLVED);
        $highSeverity = $this->repository->getHighSeverity();

        return [
            'by_status' => [
                'open' => $open->count(),
                'investigating' => $investigating->count(),
                'action_plan' => $actionPlan->count(),
                'resolved' => $resolved->count(),
            ],
            'high_severity_count' => $highSeverity->count(),
            'critical' => $this->repository->getBySeverity(IncidentReport::SEVERITY_CRITICAL)->count(),
            'high' => $this->repository->getBySeverity(IncidentReport::SEVERITY_HIGH)->count(),
        ];
    }

    protected function notifyHighSeverity(IncidentReport $report): void
    {
        // Placeholder for notification logic
        // TODO: Implement notification sending
    }
}
