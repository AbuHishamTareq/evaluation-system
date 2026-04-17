<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\MedicationBatch;
use App\Services\Pharmacy\MedicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationBatchController extends Controller
{
    public function __construct(
        protected MedicationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['medication_id', 'phc_center_id', 'status', 'per_page']);
        $data = $this->service->getAllBatches($filters);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medication_id' => 'required|exists:medications,id',
            'phc_center_id' => 'required|exists:phc_centers,id',
            'batch_number' => 'required|string|max:100|unique:medication_batches,batch_number',
            'quantity' => 'required|integer|min:0',
            'alert_threshold' => 'nullable|integer|min:0',
            'manufacture_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
        ]);

        $batch = $this->service->createBatch($validated);

        return response()->json(['data' => $batch, 'message' => 'Batch created'], 201);
    }

    public function show(MedicationBatch $medicationBatch): JsonResponse
    {
        return response()->json(['data' => $medicationBatch->load('medication')]);
    }

    public function update(Request $request, MedicationBatch $medicationBatch): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'sometimes|integer|min:0',
            'alert_threshold' => 'nullable|integer|min:0',
            'expiry_date' => 'nullable|date',
            'status' => 'nullable|in:available,low_stock,expired,recalled',
        ]);

        $batch = $this->service->updateBatch($medicationBatch, $validated);

        return response()->json(['data' => $batch, 'message' => 'Batch updated']);
    }

    public function destroy(MedicationBatch $medicationBatch): JsonResponse
    {
        $medicationBatch->delete();

        return response()->json(['message' => 'Batch deleted']);
    }
}
