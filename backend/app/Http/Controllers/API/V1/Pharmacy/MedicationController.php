<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\Medication;
use App\Services\Pharmacy\MedicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationController extends Controller
{
    public function __construct(
        protected MedicationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page']);
        $data = $this->service->getAllMedications($filters);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'atc_code' => 'nullable|string|max:20',
            'form' => 'nullable|in:tablet,capsule,liquid,injection,cream,ointment,drops,inhaler,patch,suppository,other',
            'strength' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:20',
            'storage_requirements' => 'nullable|string|max:500',
        ]);

        $medication = $this->service->createMedication($validated);

        return response()->json(['data' => $medication, 'message' => 'Medication created'], 201);
    }

    public function show(Medication $medication): JsonResponse
    {
        return response()->json(['data' => $this->service->getMedicationById($medication->id)]);
    }

    public function update(Request $request, Medication $medication): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'generic_name' => 'nullable|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'atc_code' => 'nullable|string|max:20',
            'form' => 'nullable|in:tablet,capsule,liquid,injection,cream,ointment,drops,inhaler,patch,suppository,other',
            'strength' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:20',
            'storage_requirements' => 'nullable|string|max:500',
        ]);

        $medication = $this->service->updateMedication($medication, $validated);

        return response()->json(['data' => $medication, 'message' => 'Medication updated']);
    }

    public function destroy(Medication $medication): JsonResponse
    {
        $medication->delete();

        return response()->json(['message' => 'Medication deleted']);
    }
}
