<?php

namespace App\Services\HR;

use App\Models\ShiftRequest;
use Illuminate\Pagination\LengthAwarePaginator;

class ShiftRequestService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = ShiftRequest::with(['requester', 'approver', 'originalShift', 'targetShift']);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['requester_id'])) {
            $query->where('requester_id', $filters['requester_id']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate(min($perPage, 100));
    }

    public function getById(int $id): ?ShiftRequest
    {
        return ShiftRequest::with(['requester', 'approver', 'originalShift', 'targetShift'])->find($id);
    }

    public function create(array $data): ShiftRequest
    {
        return ShiftRequest::create($data);
    }

    public function approve(ShiftRequest $request, ?string $notes = null): bool
    {
        return $request->approve($notes);
    }

    public function reject(ShiftRequest $request, ?string $notes = null): bool
    {
        return $request->reject($notes);
    }
}
