<?php

namespace App\Http\Controllers\API\V1\Core;

use App\Http\Controllers\Controller;
use App\Services\Core\ImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImportController extends Controller
{
    public function __construct(
        protected ImportService $service,
    ) {}

    public function processFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240',
            'model' => 'required|string',
            'column_mapping' => 'required|array',
        ]);

        $file = $request->file('file');
        $model = $request->input('model');
        $columnMapping = $request->input('column_mapping');

        try {
            $data = $this->service->processFile($file, $columnMapping);

            return response()->json([
                'data' => $data->take(10),
                'total_rows' => $data->count(),
                'message' => 'File processed. Validate and confirm import.',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'model' => 'required|string',
            'data' => 'required|array',
        ]);

        $model = $request->input('model');
        $data = $request->input('data');

        try {
            $class = "App\\Models\\{$model}";
            if (! class_exists($class)) {
                return response()->json(['error' => 'Model not found'], 404);
            }

            $count = $this->service->import($class, $data);

            return response()->json([
                'message' => "Successfully imported {$count} records",
                'imported_count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'data' => 'required|array',
            'rules' => 'required|array',
        ]);

        $data = $request->input('data');
        $rules = $request->input('rules');

        $errors = $this->service->validateData($data, $rules);

        return response()->json([
            'valid' => empty($errors),
            'errors' => $errors,
        ]);
    }
}
