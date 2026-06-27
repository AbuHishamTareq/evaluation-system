<?php

namespace App\Features\MedicationEvaluations\Repositories;

use App\Models\MedicationEvaluation;
use App\Models\PhcMedication;
use Illuminate\Pagination\LengthAwarePaginator;

class EloquentMedicationEvaluationRepository implements MedicationEvaluationRepositoryInterface
{
    public function getAll(array $filters): LengthAwarePaginator
    {
        $query = MedicationEvaluation::query()
            ->with(['template', 'phcCenter', 'evaluator']);

        if (isset($filters['template_id'])) {
            $query->where('template_id', $filters['template_id']);
        }

        if (isset($filters['phc_center_id'])) {
            $query->where('phc_center_id', $filters['phc_center_id']);
        }

        if (isset($filters['evaluator_id'])) {
            $query->where('evaluator_id', $filters['evaluator_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $perPage = $filters['per_page'] ?? 15;

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findById(int $id): ?MedicationEvaluation
    {
        $evaluation = MedicationEvaluation::with([
            'template.medications.medication',
            'template.criteria',
            'phcCenter',
            'evaluator',
            'answers' => function ($q) {
                $q->with(['templateMedication.medication', 'criterion']);
            },
        ])->find($id);

        if ($evaluation && $evaluation->relationLoaded('template') && $evaluation->template->relationLoaded('medications')) {
            $phcMedications = PhcMedication::where('phc_center_id', $evaluation->phc_center_id)
                ->whereIn('medication_id', $evaluation->template->medications->pluck('medication_id'))
                ->where('is_active', true)
                ->get()
                ->keyBy('medication_id');

            foreach ($evaluation->template->medications as $tm) {
                $pm = $phcMedications->get($tm->medication_id);
                if ($pm) {
                    $tm->recommended_quantity = $pm->recommended_quantity;
                    $tm->allocation_location = $pm->allocation_location;
                }
            }
        }

        return $evaluation;
    }

    public function create(array $data): MedicationEvaluation
    {
        return MedicationEvaluation::create($data);
    }

    public function update(int $id, array $data): MedicationEvaluation
    {
        $evaluation = $this->findById($id);
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
}
