<?php

namespace App\Features\Medications\Controllers;

use App\Features\Medications\Exports\MedicationExport;
use App\Features\Medications\Imports\MedicationImport;
use App\Features\Medications\Services\MedicationService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Medication;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Medications
 *
 * APIs for managing medications, including CRUD, import/export, and templates.
 */
class MedicationController extends BaseApiController
{
    public function __construct(
        protected MedicationService $medicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'is_active',
            'per_page',
        ]);

        $medications = $this->medicationService->getAllMedications($filters);

        $activeCount = Medication::where('is_active', true)->count();
        $highAlertCount = Medication::where('category', 'High Alert')->count();
        $categoriesCount = Medication::whereNotNull('category')->distinct('category')->count('category');

        return $this->paginatedResponse($medications, 'Medications retrieved successfully', [
            'active_count' => $activeCount,
            'high_alert_count' => $highAlertCount,
            'categories_count' => $categoriesCount,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'strength' => 'nullable|string|max:100',
            'form' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $medication = $this->medicationService->createMedication($validated);

        return $this->successResponse($medication, 'Medication created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $medication = $this->medicationService->getMedicationById($id);

        if (! $medication) {
            return $this->errorResponse('Medication not found', 404);
        }

        return $this->successResponse($medication, 'Medication retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'strength' => 'nullable|string|max:100',
            'form' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $medication = $this->medicationService->updateMedication($id, $validated);

        return $this->successResponse($medication, 'Medication updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->medicationService->deleteMedication($id);

        if (! $deleted) {
            return $this->errorResponse('Medication not found', 404);
        }

        return $this->successResponse(null, 'Medication deleted successfully');
    }

    public function active(): JsonResponse
    {
        $medications = $this->medicationService->getActiveMedications();

        return $this->successResponse($medications, 'Active medications retrieved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filters = $request->only(['search', 'is_active']);
        $filename = 'medications_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename, $filters);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new MedicationExport($format, $filters), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename, array $filters): Response
    {
        $query = Medication::query();

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('strength', 'like', "%{$filters['search']}%")
                    ->orWhere('form', 'like', "%{$filters['search']}%")
                    ->orWhere('category', 'like', "%{$filters['search']}%");
            });
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        $medications = $query->orderBy('name')->get();

        $html = view('exports.medications_pdf', [
            'medications' => $medications,
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
            $import = new MedicationImport;
            Excel::import($import, $request->file('file'));
            $importedCount = $import->getImportedCount();
            $skippedCount = $import->getSkippedCount();

            $message = "{$importedCount} records imported successfully";
            if ($skippedCount > 0) {
                $message .= " ({$skippedCount} records skipped)";
            }

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
            Log::error('Failed to import medications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Import failed. Please check your file and try again.', 500);
        }
    }

    public function template(): Response
    {
        $headers = [
            'Medication Name',
            'Strength',
            'Form',
            'Unit',
            'Category',
            'Is Active',
        ];

        $sampleData = [
            ['Paracetamol', '500mg', 'Tablet', 'Strip', 'Regular', 1],
            ['Amoxicillin', '500mg', 'Capsule', 'Strip', 'Antibiotic', 1],
            ['Metformin', '500mg', 'Tablet', 'Strip', 'Chronic', 1],
        ];

        $filename = 'medications-sample-'.str_replace(':', '-', now()->toIso8601String());

        return Excel::download(new class($headers, $sampleData) implements FromArray, ShouldAutoSize, WithHeadings, WithStyles
        {
            private array $headers;

            private array $sampleData;

            private const HEADER_BG = '4f81bd';

            private const HEADER_FONT_COLOR = 'FFFFFF';

            public function __construct(array $headers, array $sampleData)
            {
                $this->headers = $headers;
                $this->sampleData = $sampleData;
            }

            public function array(): array
            {
                return $this->sampleData;
            }

            public function headings(): array
            {
                return $this->headers;
            }

            public function styles(Worksheet $sheet): void
            {
                $headerRange = 'A1:'.$sheet->getHighestDataColumn().'1';
                $sheet->getStyle($headerRange)->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => self::HEADER_FONT_COLOR],
                        'size' => 11,
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => self::HEADER_BG],
                    ],
                    'alignment' => [
                        'horizontal' => 'center',
                        'vertical' => 'center',
                    ],
                ]);

                $lastRow = $sheet->getHighestDataRow();
                if ($lastRow > 1) {
                    $dataRange = 'A2:'.$sheet->getHighestDataColumn().$lastRow;
                    $sheet->getStyle($dataRange)->applyFromArray([
                        'alignment' => [
                            'vertical' => 'center',
                        ],
                    ]);
                }
            }
        }, "{$filename}.xlsx");
    }
}
