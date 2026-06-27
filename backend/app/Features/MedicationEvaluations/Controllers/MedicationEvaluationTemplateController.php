<?php

namespace App\Features\MedicationEvaluations\Controllers;

use App\Features\MedicationEvaluations\Services\MedicationEvaluationTemplateService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Medication Evaluation Templates
 *
 * APIs for managing medication evaluation templates
 */
class MedicationEvaluationTemplateController extends BaseApiController
{
    public function __construct(
        protected MedicationEvaluationTemplateService $templateService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'is_active',
            'per_page',
        ]);

        $templates = $this->templateService->getAll($filters);

        return $this->paginatedResponse($templates, 'Templates retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'criteria' => 'required|array',
            'criteria.*.name' => 'required|string',
            'criteria.*.description' => 'nullable|string',
            'criteria.*.type' => 'required|in:number,yes_no,yes_no_partial,text',
            'criteria.*.weight' => 'nullable|numeric|min:0',
            'criteria.*.order' => 'nullable|integer',
        ]);

        $template = $this->templateService->create($validated);

        return $this->successResponse($template, 'Template created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $template = $this->templateService->getById($id);

        if (! $template) {
            return $this->errorResponse('Template not found', 404);
        }

        return $this->successResponse($template, 'Template retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $template = $this->templateService->getById($id);

        if (! $template) {
            return $this->errorResponse('Template not found', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'criteria' => 'sometimes|array',
            'criteria.*.name' => 'required|string',
            'criteria.*.description' => 'nullable|string',
            'criteria.*.type' => 'required|in:number,yes_no,yes_no_partial,text',
            'criteria.*.weight' => 'nullable|numeric|min:0',
            'criteria.*.order' => 'nullable|integer',
        ]);

        $template = $this->templateService->update($id, $validated);

        return $this->successResponse($template, 'Template updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $template = $this->templateService->getById($id);

        if (! $template) {
            return $this->errorResponse('Template not found', 404);
        }

        $this->templateService->delete($id);

        return $this->successResponse(null, 'Template deleted successfully');
    }
}
