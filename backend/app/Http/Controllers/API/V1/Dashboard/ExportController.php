<?php

namespace App\Http\Controllers\API\V1\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $service,
    ) {}

    public function export(Request $request)
    {
        $type = $request->input('type');
        $format = $request->input('format', 'json');

        if (! $type) {
            return response()->json(['error' => 'type is required'], 422);
        }

        $filters = $request->only([
            'status', 'severity', 'priority', 'date_from', 'date_to', 'phc_center_id',
        ]);

        $data = $this->service->generateReport($type, $filters);

        if ($format === 'csv') {
            $filename = "{$type}_report_".now()->format('Y-m-d');

            return $this->service->exportToCsv($data['data'], $filename);
        }

        if ($format === 'excel') {
            $filename = "{$type}_report_".now()->format('Y-m-d');

            return $this->service->exportToExcel($data['data'], $filename);
        }

        if ($format === 'pdf') {
            $filename = "{$type}_report_".now()->format('Y-m-d');

            return $this->service->exportToPdf($data['data'], $filename);
        }

        return response()->json($data);
    }

    public function incidents(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'severity', 'date_from', 'date_to', 'phc_center_id']);
        $data = $this->service->exportIncidentReport($filters);

        return response()->json([
            'data' => $data,
            'count' => count($data),
        ]);
    }

    public function evaluations(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'date_from', 'date_to']);
        $data = $this->service->exportEvaluationReport($filters);

        return response()->json([
            'data' => $data,
            'count' => count($data),
        ]);
    }

    public function staff(Request $request): JsonResponse
    {
        $filters = $request->only(['employment_status', 'phc_center_id']);
        $data = $this->service->exportStaffReport($filters);

        return response()->json([
            'data' => $data,
            'count' => count($data),
        ]);
    }

    public function issues(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'priority', 'date_from', 'date_to', 'phc_center_id']);
        $data = $this->service->exportIssueReport($filters);

        return response()->json([
            'data' => $data,
            'count' => count($data),
        ]);
    }
}
