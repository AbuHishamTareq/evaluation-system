<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\MedicationLog;
use App\Services\Pharmacy\MedicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationLogController extends Controller
{
    public function __construct(
        protected MedicationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['medication_batch_id', 'step', 'per_page']);

        $query = MedicationLog::with(['medicationBatch.medication']);

        if (! empty($filters['medication_batch_id'])) {
            $query->where('medication_batch_id', $filters['medication_batch_id']);
        }

        if (! empty($filters['step'])) {
            $query->where('step', $filters['step']);
        }

        $data = $query->orderByDesc('created_at')->paginate($filters['per_page'] ?? 15);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medication_batch_id' => 'required|exists:medication_batches,id',
            'patient_id' => 'nullable|exists:staff_profiles,id',
            'prescriber_id' => 'nullable|exists:users,id',
            'dispenser_id' => 'nullable|exists:users,id',
            'administrator_id' => 'nullable|exists:users,id',
            'verifier_id' => 'nullable|exists:users,id',
            'step' => 'required|in:prescribed,dispensed,administered,verified',
            'quantity' => 'nullable|integer|min:1',
            'notes' => 'nullable|string|max:1000',
        ]);

        $log = $this->service->createLog($validated);

        return response()->json(['data' => $log, 'message' => 'Log created'], 201);
    }

    public function show(MedicationLog $medicationLog): JsonResponse
    {
        return response()->json(['data' => $medicationLog->load('medicationBatch.medication')]);
    }
}
