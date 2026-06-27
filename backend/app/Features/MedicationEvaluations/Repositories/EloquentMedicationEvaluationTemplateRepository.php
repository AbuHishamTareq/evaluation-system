<?php

namespace App\Features\MedicationEvaluations\Repositories;

use App\Models\MedicationEvaluationTemplate;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentMedicationEvaluationTemplateRepository implements MedicationEvaluationTemplateRepositoryInterface
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = MedicationEvaluationTemplate::query()
            ->with(['medications.medication', 'criteria']);

        if (isset($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?MedicationEvaluationTemplate
    {
        return MedicationEvaluationTemplate::with([
            'medications' => function ($q) {
                $q->orderBy('order');
            },
            'medications.medication',
            'criteria' => function ($q) {
                $q->orderBy('order');
            },
        ])->find($id);
    }

    public function create(array $data): MedicationEvaluationTemplate
    {
        return MedicationEvaluationTemplate::create($data);
    }

    public function update(int $id, array $data): MedicationEvaluationTemplate
    {
        $template = $this->findById($id);
        $template->update($data);

        return $template->fresh();
    }

    public function delete(int $id): bool
    {
        $template = $this->findById($id);

        if (! $template) {
            return false;
        }

        return $template->delete();
    }
}
