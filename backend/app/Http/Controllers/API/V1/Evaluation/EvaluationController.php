<?php

namespace App\Http\Controllers\API\V1\Evaluation;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Services\Evaluation\EvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function __construct(
        protected EvaluationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['template_id', 'staff_profile_id', 'status', 'per_page']);
        $data = $this->service->getAllEvaluations($filters);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:evaluation_templates,id',
            'staff_profile_id' => 'required|exists:staff_profiles,id',
            'evaluator_id' => 'nullable|exists:users,id',
            'department_id' => 'required|exists:departments,id',
        ]);

        $evaluation = $this->service->createEvaluation($validated);

        return response()->json(['data' => $evaluation, 'message' => 'Evaluation created'], 201);
    }

    public function show(Evaluation $evaluation): JsonResponse
    {
        $evaluation->load(['template.questions', 'staffProfile', 'responses']);

        return response()->json(['data' => $evaluation]);
    }

    public function submitResponse(Request $request, Evaluation $evaluation): JsonResponse
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:evaluation_questions,id',
            'answer' => 'required',
            'score' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $response = $this->service->submitResponse($evaluation, $validated);

        return response()->json(['data' => $response, 'message' => 'Response submitted']);
    }

    public function complete(Evaluation $evaluation): JsonResponse
    {
        $this->service->completeEvaluation($evaluation);

        return response()->json(['message' => 'Evaluation completed']);
    }

    public function dashboard(): JsonResponse
    {
        return response()->json($this->service->getDashboard());
    }
}
