<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignTeamBasedCodeToPhcCenterRequest;
use App\Models\PhcCenter;
use App\Models\TeamBasedCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhcCenterAssignmentController extends Controller
{
    /**
     * Get assigned team based codes for a PHC center
     */
    public function assigned(PhcCenter $phcCenter): JsonResponse
    {
        $assignedCodes = $phcCenter->teamBasedCodes()->get();

        return response()->json([
            'data' => $assignedCodes->map(function ($code) {
                return [
                    'id' => $code->id,
                    'code' => $code->code,
                    'role' => $code->role,
                    'is_active' => $code->is_active,
                    'pivot' => [
                        'assigned_at' => $code->pivot->created_at,
                    ]
                ];
            }),
        ]);
    }

    /**
     * Get available team based codes for assignment (not yet assigned to this PHC center)
     */
    public function available(Request $request, PhcCenter $phcCenter): JsonResponse
    {
        $query = TeamBasedCode::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%");
            });
        }

        // Exclude already assigned codes
        $query->whereDoesntHave('phcCenters', function ($q) use ($phcCenter) {
            $q->where('phc_centers.id', $phcCenter->id);
        });

        $perPage = $request->input('per_page', 15);
        $availableCodes = $query->orderByDesc('created_at')->paginate($perPage);

        return response()->json([
            'data' => $availableCodes->items(),
            'meta' => [
                'total' => $availableCodes->total(),
                'current_page' => $availableCodes->currentPage(),
                'last_page' => $availableCodes->lastPage(),
                'per_page' => $availableCodes->perPage(),
            ],
        ]);
    }

    /**
     * Assign team based codes to PHC center
     */
    public function assign(AssignTeamBasedCodeToPhcCenterRequest $request, PhcCenter $phcCenter): JsonResponse
    {
        $codeIds = $request->input('team_based_code_ids', []);

        if (empty($codeIds)) {
            return response()->json([
                'message' => 'No team based codes provided for assignment',
            ], 422);
        }

        // Attach the codes to the PHC center
        $phcCenter->teamBasedCodes()->attach($codeIds);

        return response()->json([
            'message' => 'Team based codes assigned successfully',
            'assigned_count' => count($codeIds),
        ], 201);
    }

    /**
     * Remove team based code from PHC center
     */
    public function remove(PhcCenter $phcCenter, TeamBasedCode $teamBasedCode): JsonResponse
    {
        $phcCenter->teamBasedCodes()->detach($teamBasedCode->id);

        return response()->json([
            'message' => 'Team based code removed successfully',
        ]);
    }

    /**
     * Remove all assigned team based codes from PHC center
     */
    public function removeAll(PhcCenter $phcCenter): JsonResponse
    {
        $count = $phcCenter->teamBasedCodes()->count();
        $phcCenter->teamBasedCodes()->detach();

        return response()->json([
            'message' => 'All team based codes removed successfully',
            'removed_count' => $count,
        ]);
    }
}