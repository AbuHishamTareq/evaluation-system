<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStaffProfileRequest;
use App\Http\Requests\UpdateStaffProfileRequest;
use App\Models\Department;
use App\Models\MedicalField;
use App\Models\Nationality;
use App\Models\PhcCenter;
use App\Models\Rank;
use App\Models\Region;
use App\Models\ShcCategory;
use App\Models\Specialty;
use App\Models\StaffCertificate;
use App\Models\StaffEducation;
use App\Models\StaffExperience;
use App\Models\StaffProfile;
use App\Services\Core\ImportService;
use App\Services\Dashboard\ExportService;
use App\Services\HR\StaffProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class StaffProfileController extends Controller
{
    private const CACHE_PREFIX = 'staff_profiles:';

    private const CACHE_TTL = 30; // minutes

    public function __construct(
        protected StaffProfileService $service,
        protected ImportService $importService,
        protected ExportService $exportService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $cacheKey = self::CACHE_PREFIX.'index:'.md5(json_encode($request->all()));

        $data = Cache::remember($cacheKey, now()->addMinutes(self::CACHE_TTL), function () use ($request) {
            $filters = $request->only([
                'zone_id', 'phc_center_id', 'department_id', 'employment_status', 'search', 'per_page',
            ]);

            $staffProfiles = $this->service->getAll($filters);

            return [
                'data' => $staffProfiles->items(),
                'meta' => [
                    'total' => $staffProfiles->total(),
                    'current_page' => $staffProfiles->currentPage(),
                    'last_page' => $staffProfiles->lastPage(),
                    'per_page' => $staffProfiles->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(StoreStaffProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();

        if (empty($validated['employee_id'])) {
            $validated['employee_id'] = StaffProfile::generateNextEmployeeId();
        }

        $validated = $this->parseArrayFields($validated);

        $profile = $this->service->create($validated);

        $this->clearCache();

        return response()->json([
            'data' => $profile,
            'message' => 'Staff profile created successfully',
        ], 201);
    }

    protected function parseArrayFields(array $data): array
    {
        if (! empty($data['certifications']) && is_string($data['certifications'])) {
            $data['certifications'] = array_filter(array_map('trim', explode(',', $data['certifications'])));
        }
        if (! empty($data['education']) && is_string($data['education'])) {
            $data['education'] = array_filter(array_map('trim', explode(',', $data['education'])));
        }

        return $data;
    }

    public function getNextEmployeeId(): JsonResponse
    {
        return response()->json([
            'employee_id' => StaffProfile::generateNextEmployeeId(),
        ]);
    }

    public function show(StaffProfile $staffProfile): JsonResponse
    {
        $cacheKey = self::CACHE_PREFIX.'show:'.$staffProfile->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(self::CACHE_TTL), function () use ($staffProfile) {
            $staffProfile->load([
                'user', 'zone', 'phcCenter', 'department', 'nationality',
                'shcCategory.medicalField', 'shcCategory.specialty', 'shcCategory.rank',
                'certificates', 'educations', 'experiences',
            ]);

            return ['data' => $staffProfile];
        });

        return response()->json($data);
    }

    public function update(UpdateStaffProfileRequest $request, StaffProfile $staffProfile): JsonResponse
    {
        $validated = $this->parseArrayFields($request->validated());

        if (! empty($validated['email'])) {
            if ($staffProfile->user) {
                $staffProfile->user->update(['email' => $validated['email']]);
            }
            $staffProfile->update(['email' => $validated['email']]);
        }
        unset($validated['email']);

        $profile = $this->service->update($staffProfile, $validated);

        $this->clearCache();
        Cache::forget(self::CACHE_PREFIX.'show:'.$staffProfile->id);

        return response()->json([
            'data' => $profile->load(['user', 'shcCategory']),
            'message' => 'Staff profile updated successfully',
        ]);
    }

    public function destroy(StaffProfile $staffProfile): JsonResponse
    {
        $this->service->delete($staffProfile);

        $this->clearCache();
        Cache::forget(self::CACHE_PREFIX.'show:'.$staffProfile->id);

        return response()->json(['message' => 'Staff profile deleted successfully']);
    }

    public function toggleStatus(StaffProfile $staffProfile): JsonResponse
    {
        if ($staffProfile->isAdmin()) {
            return response()->json(['error' => 'Admin cannot be terminated'], 422);
        }

        $newStatus = $staffProfile->employment_status === 'active' ? 'terminated' : 'active';
        $staffProfile->update(['employment_status' => $newStatus]);

        $this->clearCache();
        Cache::forget(self::CACHE_PREFIX.'show:'.$staffProfile->id);

        return response()->json([
            'data' => $staffProfile->fresh(),
            'message' => $newStatus === 'active' ? 'Staff activated successfully' : 'Staff terminated successfully',
        ]);
    }

    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'status' => 'required|in:active,suspended,on_leave,terminated',
        ]);

        $ids = $request->input('ids');
        $status = $request->input('status');

        $admins = StaffProfile::whereIn('id', $ids)
            ->with('user')
            ->get()
            ->filter(fn ($s) => $s->isAdmin())
            ->pluck('id')
            ->toArray();

        if (! empty($admins)) {
            return response()->json([
                'error' => 'Cannot change status of admin users',
            ], 422);
        }

        $count = StaffProfile::whereIn('id', $ids)->update(['employment_status' => $status]);

        $this->clearCache();
        foreach ($ids as $id) {
            Cache::forget(self::CACHE_PREFIX.'show:'.$id);
        }

        return response()->json([
            'message' => "Updated {$count} staff profiles to {$status}",
            'updated_count' => $count,
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240',
        ]);

        $file = $request->file('file');

        $columnMapping = [
            'Employee ID' => 'employee_id',
            'First Name' => 'first_name',
            'Last Name' => 'last_name',
            'First Name (Arabic)' => 'first_name_ar',
            'Last Name (Arabic)' => 'last_name_ar',
            'National ID' => 'national_id',
            'Nationality' => 'nationality_id',
            'Birth Date' => 'birth_date',
            'Gender' => 'gender',
            'Phone' => 'phone',
            'Email' => 'email',
            'Zone' => 'zone_id',
            'PHC Center' => 'phc_center_id',
            'Department' => 'department_id',
            'Medical Field' => 'medical_field_id',
            'Specialty' => 'specialty_id',
            'Rank' => 'rank_id',
            'Status' => 'employment_status',
            'Hire Date' => 'hire_date',
            'License Number' => 'scfhs_license',
            'License Expiry Date' => 'scfhs_license_expiry',
            'Policy Number' => 'malpractice_insurance',
            'Policy Expiry Date' => 'malpractice_expiry',
        ];

        try {
            $data = $this->importService->processFile($file, $columnMapping);

            $zoneMap = Region::pluck('id', 'name')->toArray();
            $phcCenterMap = PhcCenter::pluck('id', 'name')->toArray();
            $departmentMap = Department::pluck('id', 'name')->toArray();
            $nationalityMap = Nationality::pluck('id', 'name')->toArray();
            $medicalFieldMap = MedicalField::pluck('id', 'name')->toArray();
            $specialtyMap = Specialty::pluck('id', 'name')->toArray();
            $rankMap = Rank::pluck('id', 'name')->toArray();

            $shcCategoryMap = [];
            $shcCategories = ShcCategory::all();
            foreach ($shcCategories as $shc) {
                $key = ($medicalFieldMap[$shc->medical_field_id] ?? '').'|'.($specialtyMap[$shc->specialty_id] ?? '').'|'.($rankMap[$shc->rank_id] ?? '');
                $shcCategoryMap[$key] = $shc->id;
            }

            $processedData = $data->map(function ($row) use ($zoneMap, $phcCenterMap, $departmentMap, $nationalityMap, $medicalFieldMap, $specialtyMap, $rankMap, $shcCategoryMap) {
                if (! empty($row['zone_id'])) {
                    $row['zone_id'] = $zoneMap[$row['zone_id']] ?? null;
                }
                if (! empty($row['phc_center_id'])) {
                    $row['phc_center_id'] = $phcCenterMap[$row['phc_center_id']] ?? null;
                }
                if (! empty($row['department_id'])) {
                    $row['department_id'] = $departmentMap[$row['department_id']] ?? null;
                }
                if (! empty($row['nationality_id'])) {
                    $row['nationality_id'] = $nationalityMap[$row['nationality_id']] ?? null;
                }

                $mfName = $medicalFieldMap[$row['medical_field_id']] ?? '';
                $spName = $specialtyMap[$row['specialty_id']] ?? '';
                $rkName = $rankMap[$row['rank_id']] ?? '';

                if (! empty($row['medical_field_id']) && ! empty($row['specialty_id']) && ! empty($row['rank_id'])) {
                    $key = $mfName.'|'.$spName.'|'.$rkName;
                    $row['shc_category_id'] = $shcCategoryMap[$key] ?? null;
                }

                unset($row['medical_field_id'], $row['specialty_id'], $row['rank_id']);

                return $row;
            });

            $count = $this->importService->import(StaffProfile::class, $processedData->toArray());

            $this->clearCache();

            return response()->json([
                'message' => "Successfully imported {$count} records",
                'imported_count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function downloadTemplate(Request $request): Response
    {
        $format = $request->input('format', 'csv');

        $zones = Region::pluck('name')->toArray();
        $phcCenters = PhcCenter::pluck('name')->toArray();
        $departments = Department::pluck('name')->toArray();
        $medicalFields = MedicalField::pluck('name')->toArray();
        $specialties = Specialty::pluck('name')->toArray();
        $ranks = Rank::pluck('name')->toArray();
        $nationalities = Nationality::pluck('name')->toArray();

        $headers = [
            'Employee ID', 'First Name', 'Last Name', 'First Name (Arabic)', 'Last Name (Arabic)',
            'National ID', 'Nationality', 'Birth Date', 'Gender',
            'Phone', 'Email',
            'Zone', 'PHC Center', 'Department',
            'Medical Field', 'Specialty', 'Rank',
            'Status', 'Hire Date',
            'License Number', 'License Expiry Date',
            'Policy Number', 'Policy Expiry Date',
        ];

        $sampleData = [
            [
                'EMP001', 'John', 'Doe', 'جون', 'ديو',
                '1234567890', $nationalities[0] ?? 'Saudi Arabia', '1990-01-01', 'male',
                '966501234567', 'john@example.com',
                $zones[0] ?? 'Central', $phcCenters[0] ?? 'Main PHC', $departments[0] ?? 'Nursing',
                $medicalFields[0] ?? 'Medicine', $specialties[0] ?? 'General', $ranks[0] ?? 'Specialist',
                'active', '2024-01-01',
                'SCFHS12345', '2027-01-01',
                'POL12345', '2027-01-01',
            ],
        ];
        $allData = array_merge([$headers], $sampleData);

        if ($format === 'excel') {
            return $this->exportService->exportToExcel($allData, 'staff_import_template');
        }

        $output = '';
        foreach ($allData as $row) {
            $output .= '"'.implode('","', $row).'"'."\n";
        }

        return response($output, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="staff_import_template.csv"',
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $filters = $request->only(['employment_status', 'phc_center_id']);

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $data = $this->exportService->exportStaffReportByIds($idArray);
        } else {
            $data = $this->exportService->exportStaffReport($filters);
        }

        $filename = 'staff_export_'.now()->format('Y-m-d');

        return match ($format) {
            'excel' => $this->exportService->exportToExcel($data, $filename),
            'pdf' => $this->exportService->exportToPdf($data, $filename),
            default => $this->exportService->exportToCsv($data, $filename),
        };
    }

    public function educations(StaffProfile $staffProfile): JsonResponse
    {
        return response()->json(['data' => $staffProfile->educations]);
    }

    public function storeEducation(Request $request, StaffProfile $staffProfile): JsonResponse
    {
        $validated = $request->validate([
            'school_name' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'start_date' => 'nullable|date',
            'graduation_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $education = $staffProfile->educations()->create($validated);

        return response()->json(['data' => $education, 'message' => 'Education added successfully'], 201);
    }

    public function updateEducation(Request $request, StaffProfile $staffProfile, StaffEducation $staffEducation): JsonResponse
    {
        $validated = $request->validate([
            'school_name' => 'sometimes|string|max:255',
            'degree' => 'sometimes|string|max:255',
            'field_of_study' => 'nullable|string|max:255',
            'gpa' => 'nullable|numeric|min:0|max:4',
            'start_date' => 'nullable|date',
            'graduation_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $staffEducation->update($validated);

        return response()->json(['data' => $staffEducation, 'message' => 'Education updated successfully']);
    }

    public function destroyEducation(StaffProfile $staffProfile, StaffEducation $staffEducation): JsonResponse
    {
        $staffEducation->delete();

        return response()->json(['message' => 'Education deleted successfully']);
    }

    public function certificates(StaffProfile $staffProfile): JsonResponse
    {
        return response()->json(['data' => $staffProfile->certificates]);
    }

    public function storeCertificate(Request $request, StaffProfile $staffProfile): JsonResponse
    {
        $validated = $request->validate([
            'institute_name' => 'required|string|max:255',
            'certificate_name' => 'required|string|max:255',
            'certificate_type' => 'nullable|string|max:255',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $certificate = $staffProfile->certificates()->create($validated);

        return response()->json(['data' => $certificate, 'message' => 'Certificate added successfully'], 201);
    }

    public function updateCertificate(Request $request, StaffProfile $staffProfile, StaffCertificate $staffCertificate): JsonResponse
    {
        $validated = $request->validate([
            'institute_name' => 'sometimes|string|max:255',
            'certificate_name' => 'sometimes|string|max:255',
            'certificate_type' => 'nullable|string|max:255',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $staffCertificate->update($validated);

        return response()->json(['data' => $staffCertificate, 'message' => 'Certificate updated successfully']);
    }

    public function destroyCertificate(StaffProfile $staffProfile, StaffCertificate $staffCertificate): JsonResponse
    {
        $staffCertificate->delete();

        return response()->json(['message' => 'Certificate deleted successfully']);
    }

    public function experiences(StaffProfile $staffProfile): JsonResponse
    {
        return response()->json(['data' => $staffProfile->experiences]);
    }

    public function storeExperience(Request $request, StaffProfile $staffProfile): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean',
            'responsibilities' => 'nullable|string',
        ]);

        $experience = $staffProfile->experiences()->create($validated);

        return response()->json(['data' => $experience, 'message' => 'Experience added successfully'], 201);
    }

    public function updateExperience(Request $request, StaffProfile $staffProfile, StaffExperience $staffExperience): JsonResponse
    {
        $validated = $request->validate([
            'company_name' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_current' => 'boolean',
            'responsibilities' => 'nullable|string',
        ]);

        $staffExperience->update($validated);

        return response()->json(['data' => $staffExperience, 'message' => 'Experience updated successfully']);
    }

    public function destroyExperience(StaffProfile $staffProfile, StaffExperience $staffExperience): JsonResponse
    {
        $staffExperience->delete();

        return response()->json(['message' => 'Experience deleted successfully']);
    }

    private function clearCache(): void
    {
        Cache::tags([self::CACHE_PREFIX])->flush();
    }
}
