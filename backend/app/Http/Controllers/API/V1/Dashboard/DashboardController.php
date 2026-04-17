<?php

namespace App\Http\Controllers\API\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $service,
    ) {}

    public function kpiSummary(Request $request): JsonResponse
    {
        $phcCenterId = $request->input('phc_center_id');
        $regionId = $request->input('region_id');

        $data = $this->service->getKpiSummary($phcCenterId, $regionId);

        return response()->json($data);
    }

    public function drillDown(Request $request): JsonResponse
    {
        $entityType = $request->input('entity_type');
        $entityId = $request->input('entity_id');
        $breadcrumbs = $request->input('breadcrumbs', []);

        if (! $entityType || ! $entityId) {
            return response()->json(['error' => 'entity_type and entity_id are required'], 422);
        }

        $data = $this->service->getDrillDown($entityType, $entityId, $breadcrumbs);

        return response()->json($data);
    }

    public function comparative(Request $request): JsonResponse
    {
        $phcCenterId = $request->input('phc_center_id');
        $regionId = $request->input('region_id');

        $data = $this->service->getComparativeMetrics($phcCenterId, $regionId);

        return response()->json($data);
    }

    public function trends(Request $request): JsonResponse
    {
        $metric = $request->input('metric', 'incidents');
        $days = $request->input('days', 30);

        $data = $this->service->getTrendData($metric, $days);

        return response()->json($data);
    }
}
