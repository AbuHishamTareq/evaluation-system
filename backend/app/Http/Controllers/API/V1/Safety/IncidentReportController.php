<?php

namespace App\Http\Controllers\API\V1\Safety;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreIncidentReportRequest;
use App\Http\Requests\UpdateIncidentReportRequest;
use App\Models\IncidentReport;
use App\Services\HR\IncidentReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IncidentReportController extends Controller
{
    public function __construct(
        protected IncidentReportService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'phc_center_id', 'type', 'severity', 'status', 'search', 'per_page',
        ]);

        $data = $this->service->getAll($filters);

        return response()->json($data);
    }

    public function store(StoreIncidentReportRequest $request): JsonResponse
    {
        $report = $this->service->create($request->validated());

        return response()->json([
            'data' => $report,
            'message' => 'Incident report created successfully',
        ], 201);
    }

    public function show(IncidentReport $incidentReport): JsonResponse
    {
        return response()->json(['data' => $incidentReport]);
    }

    public function update(UpdateIncidentReportRequest $request, IncidentReport $incidentReport): JsonResponse
    {
        $report = $this->service->update($incidentReport, $request->validated());

        return response()->json([
            'data' => $report,
            'message' => 'Incident report updated successfully',
        ]);
    }

    public function destroy(IncidentReport $incidentReport): JsonResponse
    {
        $this->service->delete($incidentReport);

        return response()->json(['message' => 'Incident report deleted successfully']);
    }

    public function dashboard(Request $request): JsonResponse
    {
        return response()->json($this->service->getDashboard());
    }
}
