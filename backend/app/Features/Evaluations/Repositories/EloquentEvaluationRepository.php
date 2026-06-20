<?php

namespace App\Features\Evaluations\Repositories;

use App\Models\Evaluation;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentEvaluationRepository implements EvaluationRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = Evaluation::query()->with(['template', 'center', 'staff', 'evaluator', 'answers.question']);

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['staff_id'])) {
            $query->where('staff_id', $filters['staff_id']);
        }

        if (isset($filters['evaluator_id'])) {
            $query->where('evaluator_id', $filters['evaluator_id']);
        }

        if (isset($filters['center_id'])) {
            $query->where('phc_center_id', $filters['center_id']);
        }

        if (isset($filters['template_id'])) {
            $query->where('template_id', $filters['template_id']);
        }

        if (isset($filters['search'])) {
            $query->whereHas('center', function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%");
            });
        }

        $perPage = min((int) ($filters['per_page'] ?? 15), 100);

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?Evaluation
    {
        return Evaluation::with(['template.questions.question', 'center', 'staff', 'evaluator', 'answers.question'])->find($id);
    }

    public function create(array $data): Evaluation
    {
        return Evaluation::create($data);
    }

    public function update(int $id, array $data): Evaluation
    {
        $evaluation = $this->findById($id);
        if (! $evaluation) {
            throw new \InvalidArgumentException("Evaluation not found: {$id}");
        }
        $evaluation->update($data);

        return $evaluation->fresh();
    }

    public function delete(int $id): bool
    {
        $evaluation = $this->findById($id);
        if (! $evaluation) {
            return false;
        }

        return $evaluation->delete();
    }

    public function getByStaff(int $staffId): LengthAwarePaginator
    {
        return Evaluation::where('staff_id', $staffId)
            ->with(['template', 'center', 'evaluator', 'answers'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function getByEvaluator(int $evaluatorId): LengthAwarePaginator
    {
        return Evaluation::where('evaluator_id', $evaluatorId)
            ->with(['template', 'center', 'staff', 'answers'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function getByStatus(string $status): LengthAwarePaginator
    {
        return Evaluation::where('status', $status)
            ->with(['template', 'center', 'staff', 'evaluator'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }

    public function getByPeriod(string $startDate, string $endDate): LengthAwarePaginator
    {
        return Evaluation::whereBetween('created_at', [$startDate, $endDate])
            ->with(['template', 'center', 'staff', 'evaluator', 'answers'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);
    }
}
