<?php

namespace App\Http\Controllers\API\V1\Issues;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Services\Issues\IssueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssueController extends Controller
{
    public function __construct(
        protected IssueService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['phc_center_id', 'status', 'priority', 'assignee_id', 'search', 'per_page']);
        $data = $this->service->getAllIssues($filters);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'phc_center_id' => 'required|exists:phc_centers,id',
            'reporter_id' => 'required|exists:users,id',
            'assignee_id' => 'nullable|exists:users,id',
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'linked_incident_id' => 'nullable|exists:incident_reports,id',
            'linked_evaluation_id' => 'nullable|exists:evaluations,id',
        ]);

        $issue = $this->service->createIssue($validated);

        return response()->json(['data' => $issue, 'message' => 'Issue created'], 201);
    }

    public function show(Issue $issue): JsonResponse
    {
        return response()->json(['data' => $this->service->getIssueById($issue->id)]);
    }

    public function update(Request $request, Issue $issue): JsonResponse
    {
        $validated = $request->validate([
            'assignee_id' => 'nullable|exists:users,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:5000',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'status' => 'nullable|in:open,in_progress,resolved,closed',
        ]);

        $issue = $this->service->updateIssue($issue, $validated);

        return response()->json(['data' => $issue, 'message' => 'Issue updated']);
    }

    public function destroy(Issue $issue): JsonResponse
    {
        $issue->delete();

        return response()->json(['message' => 'Issue deleted']);
    }

    public function addComment(Request $request, Issue $issue): JsonResponse
    {
        $validated = $request->validate([
            'comment' => 'required|string|max:5000',
        ]);

        $user = $request->user();
        $comment = $this->service->addComment($issue, $user->id, $validated['comment']);

        return response()->json(['data' => $comment, 'message' => 'Comment added'], 201);
    }

    public function dashboard(): JsonResponse
    {
        return response()->json($this->service->getDashboard());
    }
}
