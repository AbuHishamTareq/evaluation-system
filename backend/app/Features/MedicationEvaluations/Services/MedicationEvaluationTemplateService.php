<?php

namespace App\Features\MedicationEvaluations\Services;

use App\Features\MedicationEvaluations\Repositories\MedicationEvaluationTemplateRepositoryInterface;
use App\Models\Medication;
use App\Models\MedicationEvaluationTemplate;
use App\Models\MedicationEvaluationTemplateCriterion;
use App\Models\MedicationEvaluationTemplateMedication;
use Illuminate\Pagination\LengthAwarePaginator;

class MedicationEvaluationTemplateService
{
    public function __construct(
        protected MedicationEvaluationTemplateRepositoryInterface $templateRepository
    ) {}

    public function getAll(array $filters): LengthAwarePaginator
    {
        return $this->templateRepository->getAll($filters);
    }

    public function getById(int $id): ?MedicationEvaluationTemplate
    {
        return $this->templateRepository->findById($id);
    }

    public function create(array $data): MedicationEvaluationTemplate
    {
        $template = $this->templateRepository->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $medications = Medication::where('is_active', true)->get();
        foreach ($medications as $index => $medication) {
            MedicationEvaluationTemplateMedication::create([
                'template_id' => $template->id,
                'medication_id' => $medication->id,
                'recommended_quantity' => 0,
                'order' => $index,
            ]);
        }

        if (isset($data['criteria'])) {
            foreach ($data['criteria'] as $index => $critData) {
                MedicationEvaluationTemplateCriterion::create([
                    'template_id' => $template->id,
                    'name' => $critData['name'],
                    'description' => $critData['description'] ?? null,
                    'type' => $critData['type'],
                    'weight' => $critData['weight'] ?? 1.00,
                    'order' => $critData['order'] ?? $index,
                ]);
            }
        }

        return $this->getById($template->id);
    }

    public function update(int $id, array $data): MedicationEvaluationTemplate
    {
        $template = $this->templateRepository->findById($id);

        $this->templateRepository->update($id, [
            'name' => $data['name'] ?? $template->name,
            'description' => array_key_exists('description', $data) ? $data['description'] : $template->description,
            'is_active' => $data['is_active'] ?? $template->is_active,
        ]);

        if (isset($data['criteria'])) {
            $template->criteria()->delete();

            foreach ($data['criteria'] as $index => $critData) {
                MedicationEvaluationTemplateCriterion::create([
                    'template_id' => $template->id,
                    'name' => $critData['name'],
                    'description' => $critData['description'] ?? null,
                    'type' => $critData['type'],
                    'weight' => $critData['weight'] ?? 1.00,
                    'order' => $critData['order'] ?? $index,
                ]);
            }
        }

        return $this->getById($template->id);
    }

    public function delete(int $id): void
    {
        $this->templateRepository->delete($id);
    }
}
