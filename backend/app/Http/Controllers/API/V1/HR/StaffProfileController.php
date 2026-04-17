<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffProfileRequest;
use App\Http\Requests\UpdateStaffProfileRequest;
use App\Models\StaffProfile;
use App\Services\HR\StaffProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffProfileController extends Controller
{
    public function __construct(
        protected StaffProfileService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'phc_center_id', 'department_id', 'employment_status', 'search', 'per_page',
        ]);

        $data = $this->service->getAll($filters);

        return response()->json($data);
    }

    public function store(StoreStaffProfileRequest $request): JsonResponse
    {
        $profile = $this->service->create($request->validated());

        return response()->json([
            'data' => $profile,
            'message' => 'Staff profile created successfully',
        ], 201);
    }

    public function show(StaffProfile $staffProfile): JsonResponse
    {
        return response()->json(['data' => $staffProfile]);
    }

    public function update(UpdateStaffProfileRequest $request, StaffProfile $staffProfile): JsonResponse
    {
        $profile = $this->service->update($staffProfile, $request->validated());

        return response()->json([
            'data' => $profile,
            'message' => 'Staff profile updated successfully',
        ]);
    }

    public function destroy(StaffProfile $staffProfile): JsonResponse
    {
        $this->service->delete($staffProfile);

        return response()->json(['message' => 'Staff profile deleted successfully']);
    }
}
