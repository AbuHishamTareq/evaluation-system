<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Services\HR\ShiftService;
use App\Services\HR\StaffProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function __construct(
        protected StaffProfileService $staffService,
        protected ShiftService $shiftService,
    ) {}

    public function staffShortages(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);

        $alerts = $this->staffService->getAlerts($days);

        return response()->json([
            'data' => $alerts,
            'summary' => [
                'total_staff_checked' => count($alerts),
                'staff_with_alerts' => count($alerts),
            ],
        ]);
    }

    public function departmentCoverage(Request $request): JsonResponse
    {
        $departmentId = $request->input('department_id');
        $dateFrom = $request->input('date_from', now()->toDateString());
        $dateTo = $request->input('date_to', now()->addDays(7)->toDateString());

        $query = Department::query()->where('is_active', true);
        if ($departmentId) {
            $query->where('id', $departmentId);
        }

        $departments = $query->get()->map(function ($department) use ($dateFrom, $dateTo) {
            return $this->shiftService->getDepartmentCoverage(
                $department->id,
                $dateFrom,
                $dateTo
            );
        });

        return response()->json([
            'data' => $departments,
            'date_range' => ['from' => $dateFrom, 'to' => $dateTo],
        ]);
    }
}
