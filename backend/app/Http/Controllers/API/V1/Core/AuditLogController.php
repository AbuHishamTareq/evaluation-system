<?php

namespace App\Http\Controllers\API\V1\Core;

use App\Http\Controllers\Controller;
use App\Services\Core\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function __construct(
        protected AuditService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['entity_type', 'entity_id', 'user_id', 'action', 'per_page']);
        $data = $this->service->getLogs($filters);

        return response()->json($data);
    }

    public function history(Request $request): JsonResponse
    {
        $entityType = $request->input('entity_type');
        $entityId = $request->input('entity_id');

        if (! $entityType || ! $entityId) {
            return response()->json(['error' => 'entity_type and entity_id are required'], 422);
        }

        $data = $this->service->getEntityHistory($entityType, $entityId);

        return response()->json(['data' => $data]);
    }
}
