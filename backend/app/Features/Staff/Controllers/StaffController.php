<?php

namespace App\Features\Staff\Controllers;

use App\Features\Staff\Exports\StaffExport;
use App\Features\Staff\Exports\StaffSampleExport;
use App\Features\Staff\Imports\StaffImport;
use App\Features\Staff\Services\StaffService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Staff;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Staff Management
 *
 * APIs for managing staff members, including CRUD operations, import/export,
 * document uploads, and CV generation.
 */
class StaffController extends BaseApiController
{
    public function __construct(
        protected StaffService $staffService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'status', 'employment_type', 'is_active', 'per_page', 'sort_field', 'sort_direction']);
        $staff = $this->staffService->getAllStaff($filters);

        return $this->paginatedResponse($staff, 'Staff retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $selectedDegrees = $request->input('selectedDegrees', []);
        $experiences = $request->input('experiences', []);
        $certificates = $request->input('certificates', []);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'employee_id' => 'required|string|max:255|unique:staff,employee_id',
            'email' => 'nullable|email|max:255|unique:staff,email',
            'phone' => 'nullable|string|max:255',
            'department_id' => 'nullable|integer|exists:departments,id',
            'clinic_assignment_id' => 'nullable|integer|exists:clinic_assignments,id',
            'professional_id' => 'nullable|integer|exists:professionals,id',
            'employment_type' => 'nullable|string|in:full_time,part_time,contract,temporary,volunteer',
            'status' => 'nullable|string|in:active,inactive,suspended,terminated',
            'is_active' => 'nullable|boolean',
            'is_care_provider' => 'nullable|boolean',
            'phc_center_id' => 'nullable|integer|exists:phc_centers,id',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'national_id' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:100',
            'mobile' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'photo_path' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'termination_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'field_id' => 'nullable|integer|exists:fields,id',
            'specialty_id' => 'nullable|integer|exists:specialties,id',
            'rank_id' => 'nullable|integer|exists:ranks,id',
            'classification_category_id' => 'nullable|integer|exists:categories,id',
            'team_code_id' => 'nullable|integer|exists:team_codes,id',
            'scfhs_registration_no' => 'nullable|string|max:255',
            'scfhs_issue_date' => 'nullable|date',
            'scfhs_expiry_date' => 'nullable|date|after_or_equal:scfhs_issue_date',
            'malpractice_insurance_no' => 'nullable|string|max:255',
            'malpractice_issue_date' => 'nullable|date',
            'malpractice_expiry_date' => 'nullable|date|after_or_equal:malpractice_issue_date',
        ]);

        $staff = $this->staffService->createStaff($validated);

        if ($request->has('selectedDegrees')) {
            $this->staffService->syncEducationalDegrees($staff, $selectedDegrees);
        }
        if ($request->has('experiences')) {
            $this->staffService->syncExperiences($staff, $experiences);
        }
        if ($request->has('certificates')) {
            $this->staffService->syncCertificates($staff, $certificates);
        }

        return $this->successResponse($staff, 'Staff created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->errorResponse('Staff not found', 404);
        }

        $staff->load(['educationalDegrees', 'experiences', 'certifications', 'documents', 'department', 'clinicAssignment', 'professional']);

        return $this->successResponse($staff, 'Staff retrieved successfully');
    }

    public function exportCv(Staff $staff): Response
    {
        $staff->load(['center', 'teamCode', 'educationalDegrees']);

        $options = new Options;
        $options->set('isHtml5ParserEnabled', config('dompdf.is_html5_parser_enabled', true));
        $options->set('isRemoteEnabled', config('dompdf.is_remote_enabled', false));
        $options->set('defaultFont', config('dompdf.default_font', 'sans-serif'));
        $options->set('isFontSubsettingEnabled', config('dompdf.is_font_subsetting_enabled', false));
        $options->set('fontHeightRatio', config('dompdf.font_height_ratio', 1.1));

        try {
            $dompdf = new Dompdf($options);
            $dompdf->loadHtml(view('staff.cv', compact('staff'))->render());
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $filename = 'CV_'.str_replace([' ', '/', '\\'], '_', $staff->full_name).'_'.$staff->employee_id.'.pdf';

            return new Response($dompdf->output(), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'inline; filename="'.$filename.'"',
                'Content-Length' => strlen($dompdf->output()),
            ]);
        } catch (\Throwable $e) {
            Log::error('CV PDF generation failed for staff #'.$staff->id.': '.$e->getMessage(), [
                'exception' => $e,
                'staff_id' => $staff->id,
            ]);

            return response()->json([
                'message' => 'Failed to generate CV PDF. Please try again later.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function deactivations(Staff $staff): JsonResponse
    {
        $history = $staff->deactivations()
            ->orderBy('deactivated_at', 'desc')
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'deactivation_reason' => $d->deactivation_reason,
                'deactivation_notes' => $d->deactivation_notes,
                'deactivated_at' => $d->deactivated_at?->toIso8601String(),
                'reactivated_at' => $d->reactivated_at?->toIso8601String(),
                'reactivation_notes' => $d->reactivation_notes,
            ]);

        return $this->successResponse($history, 'Deactivation history retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->errorResponse('Staff not found', 404);
        }

        $selectedDegrees = $request->input('selectedDegrees', []);
        $experiences = $request->input('experiences', []);
        $certificates = $request->input('certificates', []);

        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'employee_id' => 'sometimes|string|max:255|unique:staff,employee_id,'.$id,
            'email' => 'nullable|email|max:255|unique:staff,email,'.$id,
            'phone' => 'nullable|string|max:255',
            'department_id' => 'nullable|integer|exists:departments,id',
            'clinic_assignment_id' => 'nullable|integer|exists:clinic_assignments,id',
            'professional_id' => 'nullable|integer|exists:professionals,id',
            'employment_type' => 'nullable|string|in:full_time,part_time,contract,temporary,volunteer',
            'status' => 'nullable|string|in:active,inactive,suspended,terminated',
            'is_active' => 'nullable|boolean',
            'is_care_provider' => 'nullable|boolean',
            'phc_center_id' => 'nullable|integer|exists:phc_centers,id',
            'gender' => 'nullable|string|in:male,female,other',
            'date_of_birth' => 'nullable|date',
            'national_id' => 'nullable|string|max:255',
            'nationality' => 'nullable|string|max:100',
            'mobile' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'photo_path' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date',
            'termination_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'field_id' => 'nullable|integer|exists:fields,id',
            'specialty_id' => 'nullable|integer|exists:specialties,id',
            'rank_id' => 'nullable|integer|exists:ranks,id',
            'classification_category_id' => 'nullable|integer|exists:categories,id',
            'team_code_id' => 'nullable|integer|exists:team_codes,id',
            'scfhs_registration_no' => 'nullable|string|max:255',
            'scfhs_issue_date' => 'nullable|date',
            'scfhs_expiry_date' => 'nullable|date|after_or_equal:scfhs_issue_date',
            'malpractice_insurance_no' => 'nullable|string|max:255',
            'malpractice_issue_date' => 'nullable|date',
            'malpractice_expiry_date' => 'nullable|date|after_or_equal:malpractice_issue_date',
        ]);

        $staff = $this->staffService->updateStaff($id, $validated);

        if ($request->has('selectedDegrees')) {
            $this->staffService->syncEducationalDegrees($staff, $selectedDegrees);
        }
        if ($request->has('experiences')) {
            $this->staffService->syncExperiences($staff, $experiences);
        }
        if ($request->has('certificates')) {
            $this->staffService->syncCertificates($staff, $certificates);
        }

        return $this->successResponse($staff, 'Staff updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->staffService->deleteStaff($id);

        if (! $deleted) {
            return $this->errorResponse('Staff not found', 404);
        }

        return $this->successResponse(null, 'Staff deleted successfully');
    }

    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'deactivation_reason' => 'nullable|string|max:255',
            'deactivation_notes' => 'nullable|string|max:1000',
            'reactivation_notes' => 'nullable|string|max:1000',
        ]);

        $staff = $this->staffService->toggleActive($id, $validated);

        if (! $staff) {
            return $this->errorResponse('Staff not found', 404);
        }

        $message = $staff->is_active ? 'Staff activated successfully' : 'Staff deactivated successfully';

        return $this->successResponse($staff, $message);
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->staffService->searchStaff($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Staff::count(),
            'active' => Staff::where('is_active', true)->count(),
            'by_status' => Staff::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->get(),
            'by_employment_type' => Staff::selectRaw('employment_type, COUNT(*) as count')
                ->groupBy('employment_type')
                ->get(),
        ];

        return $this->successResponse($stats, 'Staff statistics retrieved successfully');
    }

    public function byCenter(int $centerId): JsonResponse
    {
        $staff = Staff::with(['center', 'user', 'department', 'clinicAssignment', 'professional'])
            ->where('phc_center_id', $centerId)
            ->orderBy('first_name')
            ->get();

        return $this->successResponse($staff, 'Staff retrieved successfully');
    }

    public function byTeamCode(string $teamCode): JsonResponse
    {
        $staff = Staff::with(['center', 'user', 'department', 'clinicAssignment', 'professional'])
            ->whereHas('center', function ($query) use ($teamCode) {
                $query->whereHas('teamCodes', function ($q) use ($teamCode) {
                    $q->where('code', $teamCode);
                });
            })
            ->orderBy('first_name')
            ->get();

        return $this->successResponse($staff, 'Staff retrieved successfully');
    }

    public function export(Request $request): Response|BinaryFileResponse
    {
        $filters = $request->only(['search', 'status', 'employment_type', 'is_active', 'department_id']);
        $format = $request->input('format', 'xlsx');

        if ($format === 'pdf') {
            return $this->exportPdf($filters);
        }

        $writerType = match ($format) {
            'csv' => \Maatwebsite\Excel\Excel::CSV,
            'xlsx', 'xls' => \Maatwebsite\Excel\Excel::XLSX,
            default => \Maatwebsite\Excel\Excel::XLSX,
        };

        $extension = $format === 'csv' ? 'csv' : 'xlsx';

        return Excel::download(
            new StaffExport($filters),
            'staff_export_'.now()->format('Y-m-d_His').'.'.$extension,
            $writerType
        );
    }

    protected function exportPdf(array $filters): Response
    {
        $query = Staff::query()
            ->with(['center', 'department', 'professional', 'clinicAssignment']);

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('middle_name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        $staff = $query->orderBy('first_name')->get();

        $html = view('exports.staff_pdf', [
            'staff' => $staff,
            'generatedAt' => now()->format('d F Y, h:i A'),
        ])->render();

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        $filename = 'staff_export_'.now()->format('Y-m-d_His');

        return response($dompdf->output(), 200, [
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
            $import = new StaffImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All staff records already exist in the database.';

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
            return $this->errorResponse('Failed to import staff: '.$e->getMessage(), 500);
        }
    }

    public function sample(): BinaryFileResponse
    {
        $filename = 'staff-sample-'.now()->format('Y-m-d-His').'.xlsx';

        return Excel::download(new StaffSampleExport, $filename);
    }

    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->errorResponse('Staff not found', 404);
        }

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        if ($staff->photo_path) {
            Storage::disk('public')->delete($staff->photo_path);
        }

        $path = $request->file('photo')->store('staff/photos', 'public');

        $staff->update(['photo_path' => $path]);

        return $this->successResponse($staff->fresh(), 'Photo uploaded successfully');
    }

    public function uploadDocuments(Request $request, int $id): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->errorResponse('Staff not found', 404);
        }

        $request->validate([
            'documents' => ['required', 'array'],
            'documents.*' => ['required', 'file', 'max:10240'],
        ]);

        $uploaded = [];

        foreach ($request->file('documents') as $file) {
            $path = $file->store('staff/documents', 'public');

            $document = $staff->documents()->create([
                'name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_type' => $file->getClientMimeType(),
                'file_size' => $file->getSize(),
            ]);

            $uploaded[] = $document;
        }

        return $this->successResponse($uploaded, 'Documents uploaded successfully');
    }

    public function deleteDocument(int $id, int $documentId): JsonResponse
    {
        $staff = $this->staffService->getStaffById($id);

        if (! $staff) {
            return $this->errorResponse('Staff not found', 404);
        }

        $document = $staff->documents()->find($documentId);

        if (! $document) {
            return $this->errorResponse('Document not found', 404);
        }

        Storage::disk('public')->delete($document->file_path);

        $document->delete();

        return $this->successResponse(null, 'Document deleted successfully');
    }
}
