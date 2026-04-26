<?php

namespace App\Http\Controllers\API\V1\HR;

use App\Http\Controllers\Controller;
use App\Http\Traits\CachesIndex;
use App\Models\MedicalField;
use App\Models\Specialty;
use App\Services\Dashboard\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;

class SpecialtyController extends Controller
{
    use CachesIndex;

    protected static string $cachePrefix = 'specialties:';

    protected static int $cacheTtl = 30;

    public function __construct(
        private ExportService $exportService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['medical_field_id', 'is_active', 'search', 'per_page', 'page']);
        $cacheKey = $this->getIndexCacheKey(md5(json_encode($filters)));

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($request) {
            $query = Specialty::with('medicalField');

            if ($request->has('medical_field_id')) {
                $query->where('medical_field_id', $request->input('medical_field_id'));
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('name_ar', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            }

            $perPage = $request->input('per_page', 15);
            $specialties = $query->orderByDesc('created_at')->paginate($perPage);

            return [
                'data' => array_map(fn ($item) => $item->toArray(), $specialties->items()),
                'meta' => [
                    'total' => $specialties->total(),
                    'current_page' => $specialties->currentPage(),
                    'last_page' => $specialties->lastPage(),
                    'per_page' => $specialties->perPage(),
                ],
            ];
        });

        return response()->json($data);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'medical_field_id' => 'nullable|exists:medical_fields,id',
            'name' => 'required|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $specialty = Specialty::create($validated);

        $this->clearIndexCache();

        return response()->json([
            'data' => $specialty->toArray(),
            'message' => 'Specialty created successfully',
        ], 201);
    }

    public function show(Specialty $specialty): JsonResponse
    {
        $cacheKey = static::$cachePrefix.'show:'.$specialty->id;

        $data = Cache::remember($cacheKey, now()->addMinutes(static::$cacheTtl), function () use ($specialty) {
            $specialty->load('medicalField');

            return ['data' => $specialty->toArray()];
        });

        return response()->json($data);
    }

    public function update(Request $request, Specialty $specialty): JsonResponse
    {
        $validated = $request->validate([
            'medical_field_id' => 'nullable|exists:medical_fields,id',
            'name' => 'sometimes|string|max:255',
            'name_ar' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $specialty->update($validated);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$specialty->id);

        return response()->json([
            'data' => $specialty->toArray(),
            'message' => 'Specialty updated successfully',
        ]);
    }

    public function destroy(Specialty $specialty): JsonResponse
    {
        $specialty->delete();

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$specialty->id);

        return response()->json(['message' => 'Specialty deleted successfully']);
    }

    public function toggleStatus(Specialty $specialty): JsonResponse
    {
        $specialty->update(['is_active' => ! $specialty->is_active]);

        $this->clearIndexCache();
        Cache::forget(static::$cachePrefix.'show:'.$specialty->id);

        return response()->json([
            'data' => $specialty->fresh()->toArray(),
            'message' => $specialty->is_active ? 'Specialty activated successfully' : 'Specialty deactivated successfully',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xlsx,xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet|max:10240',
        ]);

        $file = $request->file('file');
        $columnMapping = [
            'Name' => 'name',
            'Name (Arabic)' => 'name_ar',
            'Code' => 'code',
            'Medical Field' => 'medical_field_id',
            'Status' => 'is_active',
        ];

        $data = $this->processFile($file, $columnMapping);
        $medicalFieldMap = MedicalField::pluck('id', 'name')->toArray();

        $keywordToFieldMap = [
            'nursing' => 'Nursing and Midwifery',
            'midwifery' => 'Nursing and Midwifery',
            'midwife' => 'Nursing and Midwifery',
            'critical care nursing' => 'Nursing and Midwifery',
            'cardiovascular nursing' => 'Nursing and Midwifery',
            'pediatric nursing' => 'Nursing and Midwifery',
            'emergency nursing' => 'Nursing and Midwifery',
            'intensive care nursing' => 'Nursing and Midwifery',
            'neonatal nursing' => 'Nursing and Midwifery',
            'obstetric' => 'Nursing and Midwifery',
            'dental' => 'Dentistry and Related Specialties',
            'dentist' => 'Dentistry and Related Specialties',
            'oral' => 'Dentistry and Related Specialties',
            'orthodont' => 'Dentistry and Related Specialties',
            'pharmacy' => 'Pharmacists and Pharmacy Technicians',
            'pharmacist' => 'Pharmacists and Pharmacy Technicians',
            'clinical pharmacy' => 'Pharmacists and Pharmacy Technicians',
            'pharmacology' => 'Pharmacists and Pharmacy Technicians',
            'therapy' => 'Therapy and Rehabilitation',
            'rehabilitation' => 'Therapy and Rehabilitation',
            'physical therapy' => 'Therapy and Rehabilitation',
            'occupational therapy' => 'Therapy and Rehabilitation',
            'speech therapy' => 'Therapy and Rehabilitation',
            'respiratory therapy' => 'Therapy and Rehabilitation',
            'laboratory' => 'Laboratories and Medical Technology',
            'lab' => 'Laboratories and Medical Technology',
            'medical technology' => 'Laboratories and Medical Technology',
            'pathology' => 'Laboratories and Medical Technology',
            'clinical pathology' => 'Laboratories and Medical Technology',
            'anesthesia' => 'Medicine and Surgery',
            'anesthesiology' => 'Medicine and Surgery',
            'surgery' => 'Medicine and Surgery',
            'surgical' => 'Medicine and Surgery',
            'medicine' => 'Medicine and Surgery',
            'medical' => 'Medicine and Surgery',
            'clinical' => 'Medicine and Surgery',
            'health administration' => 'Health Administration and Community Health',
            'community health' => 'Health Administration and Community Health',
            'public health' => 'Health Administration and Community Health',
            'health education' => 'Health Administration and Community Health',
            'epidemiology' => 'Health Administration and Community Health',
        ];

        $processedData = $data->map(function ($row) use ($medicalFieldMap, $keywordToFieldMap) {
            if (! empty($row['medical_field_id'])) {
                $inputField = $row['medical_field_id'];
                $matchedId = null;

                if (isset($medicalFieldMap[$inputField])) {
                    $matchedId = $medicalFieldMap[$inputField];
                } else {
                    $inputLower = strtolower($inputField);
                    foreach ($medicalFieldMap as $name => $id) {
                        if (strtolower($name) === $inputLower) {
                            $matchedId = $id;
                            break;
                        }
                    }
                }

                if ($matchedId === null) {
                    foreach ($medicalFieldMap as $name => $id) {
                        if (stripos($name, $inputField) !== false || stripos($inputField, $name) !== false) {
                            $matchedId = $id;
                            break;
                        }
                    }
                }

                if ($matchedId === null) {
                    foreach ($keywordToFieldMap as $keyword => $fieldName) {
                        if (stripos($inputField, $keyword) !== false) {
                            if (isset($medicalFieldMap[$fieldName])) {
                                $matchedId = $medicalFieldMap[$fieldName];
                                break;
                            }
                            foreach ($medicalFieldMap as $name => $id) {
                                if (strtolower($name) === strtolower($fieldName)) {
                                    $matchedId = $id;
                                    break 2;
                                }
                            }
                        }
                    }
                }

                $row['medical_field_id'] = $matchedId;
            }
            if (isset($row['is_active'])) {
                $row['is_active'] = in_array(strtolower($row['is_active']), ['active', 'نشط', '1', 'yes']) ? true : false;
            }
            if (! isset($row['is_active'])) {
                $row['is_active'] = true;
            }

            return $row;
        });

        $importedCount = 0;
        foreach ($processedData->toArray() as $specialtyData) {
            if (! empty($specialtyData['name'])) {
                Specialty::create($specialtyData);
                $importedCount++;
            }
        }

        $this->clearIndexCache();

        return response()->json([
            'message' => 'Successfully imported '.$importedCount.' specialties',
            'imported_count' => $importedCount,
        ]);
    }

    public function export(Request $request): Response
    {
        $format = $request->input('format', 'csv');
        $ids = $request->input('ids');

        $query = Specialty::with('medicalField');

        if ($ids) {
            $idArray = array_map('intval', explode(',', $ids));
            $query->whereIn('id', $idArray);
        }

        $specialties = $query->get();
        $data = $specialties->map(function ($specialty) {
            return [
                'Name' => $specialty->name,
                'Name (Arabic)' => $specialty->name_ar,
                'Code' => $specialty->code,
                'Medical Field' => $specialty->medicalField?->name,
                'Status' => $specialty->is_active ? 'Active' : 'Inactive',
            ];
        })->toArray();

        if ($format === 'excel' || $format === 'pdf') {
            return $this->exportService->exportToExcel($data, 'specialties_export');
        }

        $output = '';
        if (! empty($data)) {
            $headers = array_keys($data[0]);
            $output .= '"'.implode('","', $headers).'"'."\n";
            foreach ($data as $row) {
                $output .= '"'.implode('","', $row).'"'."\n";
            }
        }

        return response($output, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="specialties_export.csv"',
        ]);
    }

    private function processFile($file, array $columnMapping)
    {
        $extension = $file->getClientOriginalExtension();

        if (in_array($extension, ['xlsx', 'xls'])) {
            return $this->processExcelFile($file, $columnMapping);
        }

        return $this->processCsvFile($file, $columnMapping);
    }

    private function processCsvFile($file, array $columnMapping)
    {
        $data = [];
        $handle = fopen($file->getRealPath(), 'r');
        $headers = fgetcsv($handle);

        while (($row = fgetcsv($handle)) !== false) {
            $rowData = [];
            foreach ($row as $index => $value) {
                $header = $headers[$index] ?? null;
                if ($header && isset($columnMapping[$header])) {
                    $rowData[$columnMapping[$header]] = $value;
                }
            }
            $data[] = $rowData;
        }
        fclose($handle);

        return collect($data);
    }

    private function processExcelFile($file, array $columnMapping)
    {
        $spreadsheet = IOFactory::load($file->getRealPath());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (empty($rows)) {
            return collect([]);
        }

        $headers = array_shift($rows);
        $data = [];

        foreach ($rows as $row) {
            $rowData = [];
            foreach ($row as $index => $value) {
                $header = $headers[$index] ?? null;
                if ($header && isset($columnMapping[$header])) {
                    $rowData[$columnMapping[$header]] = $value;
                }
            }
            if (! empty($rowData)) {
                $data[] = $rowData;
            }
        }

        return collect($data);
    }
}
