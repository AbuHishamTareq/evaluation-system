<?php

namespace App\Features\Departments\Controllers;

use App\Features\Departments\Exports\DepartmentExport;
use App\Features\Departments\Imports\DepartmentImport;
use App\Features\Departments\Services\DepartmentService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Department;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Departments
 *
 * APIs for managing departments within the organization.
 */
class DepartmentController extends BaseApiController
{
    public function __construct(
        protected DepartmentService $departmentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'per_page', 'is_active', 'center_id']);
        $departments = $this->departmentService->getAllDepartments($filters);

        return $this->paginatedResponse($departments, 'Departments retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'center_id' => 'nullable|integer|exists:phc_centers,id',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        $department = $this->departmentService->createDepartment($validated);

        return $this->successResponse($department, 'Department created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $department = $this->departmentService->getDepartmentById($id);

        if (! $department) {
            return $this->errorResponse('Department not found', 404);
        }

        return $this->successResponse($department, 'Department retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:departments,name,'.$id,
            'description' => 'nullable|string',
            'center_id' => 'nullable|integer|exists:phc_centers,id',
            'is_active' => 'nullable|boolean',
        ]);

        $department = $this->departmentService->updateDepartment($id, $validated);

        return $this->successResponse($department, 'Department updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->departmentService->deleteDepartment($id);

        if (! $deleted) {
            return $this->errorResponse('Department not found', 404);
        }

        return $this->successResponse(null, 'Department deleted successfully');
    }

    public function toggleStatus(int $id): JsonResponse
    {
        $department = $this->departmentService->getDepartmentById($id);

        if (! $department) {
            return $this->errorResponse('Department not found', 404);
        }

        $department->update(['is_active' => ! $department->is_active]);

        return $this->successResponse($department, 'Department status toggled successfully');
    }

    public function active(): JsonResponse
    {
        $departments = $this->departmentService->getActiveDepartments();

        return $this->successResponse($departments, 'Active departments retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->departmentService->searchDepartments($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'departments_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new DepartmentExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $departments = Department::with('center')->orderBy('name')->get();

        $html = view('exports.departments_pdf', [
            'departments' => $departments,
            'generatedAt' => now()->toIso8601String(),
        ])->render();

        // Prevent accidental output from corrupting the PDF binary
        ob_start();

        // Suppress deprecation warnings for the entire Dompdf lifecycle
        $previousLevel = error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

        try {
            $options = new Options;
            $options->set('isRemoteEnabled', false);
            $options->set('isPhpEnabled', false);

            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'landscape');
            $dompdf->render();
            $output = $dompdf->output();
        } finally {
            error_reporting($previousLevel);
            ob_end_clean();
        }

        return response($output, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}.pdf\"",
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        try {
            $import = new DepartmentImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All departments already exist in the database.';

            return $this->successResponse(null, $message);
        } catch (ValidationException $e) {
            $errors = [];

            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = $message;
                }
            }

            return $this->errorResponse('Validation failed', 422, $errors);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to import departments: '.$e->getMessage(), 500);
        }
    }

    public function downloadSample(): Response
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="departments-sample-'.now()->format('Y-m-d-His').'.csv"',
        ];

        $columns = ['Name', 'Description', 'Center Name', 'Is Active'];

        $sampleData = [
            ['Cardiology', 'Heart and cardiovascular department', 'City Health Center', '1'],
            ['Pediatrics', 'Child healthcare and treatment department', 'District Hospital', '1'],
            ['Orthopedics', 'Musculoskeletal system department', 'City Health Center', '0'],
        ];

        $callback = function () use ($columns, $sampleData) {
            $file = fopen('php://output', 'w');

            fputcsv($file, $columns);

            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
