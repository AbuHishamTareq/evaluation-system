<?php

namespace App\Http\Controllers\API\V1\Pharmacy;

use App\Http\Controllers\Controller;
use App\Models\MedicationAlert;
use App\Services\Pharmacy\MedicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicationAlertController extends Controller
{
    public function __construct(
        protected MedicationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['phc_center_id', 'type', 'is_resolved', 'per_page']);
        $data = $this->service->getAlerts($filters);

        return response()->json($data);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $phcCenterId = $request->input('phc_center_id');
        $days = $request->input('days', 30);

        $alerts = $this->service->getBatchesAlerts($days);

        if ($phcCenterId) {
            $inventory = $this->service->getInventory($phcCenterId);
            $alerts['inventory'] = $inventory;
        }

        return response()->json($alerts);
    }

    public function resolve(Request $request, MedicationAlert $medicationAlert): JsonResponse
    {
        $user = $request->user();

        $medicationAlert->update([
            'is_resolved' => true,
            'resolved_by_id' => $user->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Alert resolved']);
    }
}
