<?php

namespace App\Http\Controllers\API\V1\Evaluation;

use App\Http\Controllers\Controller;
use App\Models\ActionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActionPlanController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActionPlan::with(['evaluation', 'staffProfile', 'assignedTo']);

        if (! empty($request->staff_profile_id)) {
            $query->where('staff_profile_id', $request->staff_profile_id);
        }

        if (! empty($request->status)) {
            $query->where('status', $request->status);
        }

        $data = $query->orderByDesc('created_at')->paginate($request->per_page ?? 15);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'evaluation_id' => 'required|exists:evaluations,id',
            'staff_profile_id' => 'required|exists:staff_profiles,id',
            'assigned_to_id' => 'nullable|exists:users,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'due_date' => 'nullable|date',
        ]);

        $actionPlan = ActionPlan::create($validated);

        return response()->json(['data' => $actionPlan, 'message' => 'Action plan created'], 201);
    }

    public function show(ActionPlan $actionPlan): JsonResponse
    {
        $actionPlan->load(['evaluation', 'staffProfile', 'assignedTo']);

        return response()->json(['data' => $actionPlan]);
    }

    public function update(Request $request, ActionPlan $actionPlan): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:2000',
            'status' => 'nullable|in:pending,in_progress,completed',
            'due_date' => 'nullable|date',
        ]);

        $actionPlan->update($validated);

        return response()->json(['data' => $actionPlan, 'message' => 'Action plan updated']);
    }

    public function complete(ActionPlan $actionPlan): JsonResponse
    {
        $actionPlan->complete();

        return response()->json(['message' => 'Action plan completed']);
    }
}
