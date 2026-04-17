<?php

namespace App\Repositories;

use App\Models\IncidentReport;
use App\Repositories\Interfaces\IncidentReportRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentIncidentReportRepository implements IncidentReportRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = IncidentReport::with(['reporter', 'assignedTo', 'phcCenter']);

        if (! empty($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(static function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderByDesc('created_at')->paginate(min($perPage, 100));
    }

    public function getById(int $id): ?IncidentReport
    {
        return IncidentReport::with([
            'reporter',
            'assignedTo',
            'phcCenter',
            'staffProfile',
            'responsibleOwner',
        ])->find($id);
    }

    public function create(array $data): IncidentReport
    {
        return IncidentReport::create($data);
    }

    public function update(IncidentReport $report, array $data): IncidentReport
    {
        $report->update($data);
        $report->load(['reporter', 'assignedTo', 'phcCenter']);

        return $report;
    }

    public function delete(IncidentReport $report): bool
    {
        return $report->delete();
    }

    public function getByStatus(string $status): Collection
    {
        return IncidentReport::where('status', $status)
            ->with(['reporter', 'phcCenter'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getBySeverity(string $severity): Collection
    {
        return IncidentReport::where('severity', $severity)
            ->with(['reporter', 'phcCenter'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getHighSeverity(): Collection
    {
        return IncidentReport::whereIn('severity', ['high', 'critical'])
            ->whereIn('status', ['open', 'investigating'])
            ->with(['reporter', 'phcCenter'])
            ->orderByDesc('created_at')
            ->get();
    }
}
