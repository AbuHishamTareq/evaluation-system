<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Models\ShiftRequest;
use App\Services\HR\ShiftRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftRequestController extends Controller
{
    public function __construct(
        protected ShiftRequestService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'type', 'requester_id', 'per_page']);

        $data = $this->service->getAll($filters);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requester_id' => 'required|exists:staff_profiles,id',
            'original_shift_id' => 'required|exists:shifts,id',
            'target_shift_id' => 'nullable|exists:shifts,id',
            'type' => 'required|in:swap,cover',
            'reason' => 'nullable|string|max:1000',
        ]);

        $shiftRequest = $this->service->create($validated);

        return response()->json([
            'data' => $shiftRequest,
            'message' => 'Shift request created successfully',
        ], 201);
    }

    public function show(ShiftRequest $shiftRequest): JsonResponse
    {
        return response()->json(['data' => $shiftRequest]);
    }

    public function approve(Request $request, ShiftRequest $shiftRequest): JsonResponse
    {
        $validated = $request->validate([
            'approver_notes' => 'nullable|string|max:1000',
        ]);

        $this->service->approve($shiftRequest, $validated['approver_notes'] ?? null);

        return response()->json(['message' => 'Shift request approved']);
    }

    public function reject(Request $request, ShiftRequest $shiftRequest): JsonResponse
    {
        $validated = $request->validate([
            'approver_notes' => 'nullable|string|max:1000',
        ]);

        $this->service->reject($shiftRequest, $validated['approver_notes'] ?? null);

        return response()->json(['message' => 'Shift request rejected']);
    }
}
