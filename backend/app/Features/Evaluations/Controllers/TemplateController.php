<?php

namespace App\Features\Evaluations\Controllers;

use App\Features\Evaluations\Services\TemplateService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Evaluation Templates
 *
 * APIs for managing evaluation templates used in performance reviews.
 */
class TemplateController extends BaseApiController
{
    public function __construct(
        protected TemplateService $templateService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['is_active', 'schedule_type', 'search', 'per_page']);
        $templates = $this->templateService->getAllTemplates($filters);

        return $this->paginatedResponse($templates, 'Templates retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'schedule_type' => 'nullable|string|in:one_time,monthly,quarterly,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'total_score' => 'nullable|integer|min:1',
            'is_active' => 'nullable|boolean',
            'questions' => 'nullable|array',
            'questions.*.question_id' => 'required_with:questions|integer|exists:questions,id',
            'questions.*.weight' => 'nullable|integer|min:1',
        ]);

        $template = $this->templateService->createTemplate($validated);

        return $this->successResponse($template, 'Template created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $template = $this->templateService->getTemplateById($id);

        if (! $template) {
            return $this->errorResponse('Template not found', 404);
        }

        return $this->successResponse($template, 'Template retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'schedule_type' => 'sometimes|string|in:one_time,monthly,quarterly,custom',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after:start_date',
            'total_score' => 'nullable|integer|min:1',
            'is_active' => 'sometimes|boolean',
            'questions' => 'nullable|array',
            'questions.*.question_id' => 'required_with:questions|integer|exists:questions,id',
            'questions.*.weight' => 'nullable|integer|min:1',
        ]);

        $template = $this->templateService->updateTemplate($id, $validated);

        return $this->successResponse($template, 'Template updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->templateService->deleteTemplate($id);

        if (! $deleted) {
            return $this->errorResponse('Template not found', 404);
        }

        return $this->successResponse(null, 'Template deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        try {
            $template = $this->templateService->toggleStatus($id);

            return $this->successResponse($template, 'Template status updated successfully');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    public function active(): JsonResponse
    {
        $templates = $this->templateService->getActiveTemplates();

        return $this->successResponse($templates, 'Active templates retrieved successfully');
    }
}
