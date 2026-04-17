<?php

namespace App\Http\Controllers\API\V1\Evaluation;

use App\Http\Controllers\Controller;
use App\Models\EvaluationTemplate;
use App\Services\Evaluation\EvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationTemplateController extends Controller
{
    public function __construct(
        protected EvaluationService $service,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['is_active', 'per_page']);
        $data = $this->service->getAllTemplates($filters);

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'description_ar' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $template = $this->service->createTemplate($validated);

        return response()->json(['data' => $template, 'message' => 'Template created'], 201);
    }

    public function show(EvaluationTemplate $evaluationTemplate): JsonResponse
    {
        return response()->json(['data' => $this->service->getTemplateById($evaluationTemplate->id)]);
    }

    public function update(Request $request, EvaluationTemplate $evaluationTemplate): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'description_ar' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ]);

        $template = $this->service->updateTemplate($evaluationTemplate, $validated);

        return response()->json(['data' => $template, 'message' => 'Template updated']);
    }

    public function destroy(EvaluationTemplate $evaluationTemplate): JsonResponse
    {
        $evaluationTemplate->delete();

        return response()->json(['message' => 'Template deleted']);
    }

    public function addQuestion(Request $request, EvaluationTemplate $evaluationTemplate): JsonResponse
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'question_ar' => 'nullable|string|max:255',
            'type' => 'required|in:mcq,multi_select,rating,essay',
            'options' => 'nullable|array',
            'options_ar' => 'nullable|array',
            'score' => 'nullable|integer|min:0',
            'is_required' => 'nullable|boolean',
        ]);

        $question = $this->service->addQuestion($evaluationTemplate, $validated);

        return response()->json(['data' => $question, 'message' => 'Question added'], 201);
    }

    public function importQuestions(Request $request, EvaluationTemplate $evaluationTemplate): JsonResponse
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.question' => 'required|string|max:255',
            'questions.*.type' => 'required|in:mcq,multi_select,rating,essay',
            'questions.*.options' => 'nullable|array',
        ]);

        $count = $this->service->importQuestions($evaluationTemplate, $validated['questions']);

        return response()->json(['message' => "Imported {$count} questions"]);
    }
}
