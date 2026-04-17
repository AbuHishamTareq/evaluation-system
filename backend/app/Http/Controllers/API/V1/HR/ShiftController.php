<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShiftRequest;
use App\Http\Requests\UpdateShiftRequest;
use App\Models\Shift;
use App\Services\HR\ShiftService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShiftController extends Controller
{
    public function __construct(
        protected ShiftService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'department_id', 'staff_profile_id', 'status', 'date_from', 'date_to', 'per_page',
        ]);

        $data = $this->service->getAll($filters);

        return response()->json($data);
    }

    public function store(StoreShiftRequest $request): JsonResponse
    {
        $shift = $this->service->create($request->validated());

        return response()->json([
            'data' => $shift,
            'message' => 'Shift created successfully',
        ], 201);
    }

    public function show(Shift $shift): JsonResponse
    {
        return response()->json(['data' => $shift]);
    }

    public function update(UpdateShiftRequest $request, Shift $shift): JsonResponse
    {
        $shift = $this->service->update($shift, $request->validated());

        return response()->json([
            'data' => $shift,
            'message' => 'Shift updated successfully',
        ]);
    }

    public function destroy(Shift $shift): JsonResponse
    {
        $this->service->delete($shift);

        return response()->json(['message' => 'Shift deleted successfully']);
    }
}
