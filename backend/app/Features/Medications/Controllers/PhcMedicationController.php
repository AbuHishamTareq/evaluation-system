<?php

namespace App\Features\Medications\Controllers;

use App\Features\Medications\Services\PhcMedicationService;
use App\Http\Controllers\Api\V1\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group PHC Medications
 *
 * APIs for managing medication links to PHC centers.
 */
class PhcMedicationController extends BaseApiController
{
    public function __construct(
        protected PhcMedicationService $phcMedicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'phc_center_id',
            'medication_id',
            'is_active',
            'per_page',
        ]);

        $items = $this->phcMedicationService->getAllPhcMedications($filters);

        return $this->paginatedResponse($items, 'PHC medications retrieved successfully');
    }

    public function byCenter(int $phcCenterId): JsonResponse
    {
        $items = $this->phcMedicationService->getPhcMedicationsByCenter($phcCenterId);

        return $this->successResponse($items, 'PHC medications retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phc_center_id' => 'required|integer|exists:phc_centers,id',
            'medication_id' => 'required|integer|exists:medications,id',
            'recommended_quantity' => 'required|numeric|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'allocation_location' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $item = $this->phcMedicationService->createPhcMedication($validated);

        return $this->successResponse($item, 'PHC medication linked successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->phcMedicationService->getPhcMedicationById($id);

        if (! $item) {
            return $this->errorResponse('PHC medication not found', 404);
        }

        return $this->successResponse($item, 'PHC medication retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'recommended_quantity' => 'sometimes|numeric|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'allocation_location' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $item = $this->phcMedicationService->updatePhcMedication($id, $validated);

        return $this->successResponse($item, 'PHC medication updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->phcMedicationService->deletePhcMedication($id);

        if (! $deleted) {
            return $this->errorResponse('PHC medication not found', 404);
        }

        return $this->successResponse(null, 'PHC medication unlinked successfully');
    }
}
