<?php

namespace App\Features\Medications\Controllers;

use App\Features\Medications\Exports\PhcMedicationExport;
use App\Features\Medications\Imports\PhcMedicationImport;
use App\Features\Medications\Services\PhcMedicationService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\PhcMedication;
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
 * @group PHC Medications
 *
 * APIs for managing medication links to PHC centers.
 */
class PhcMedicationController extends BaseApiController
{
    public function __construct(
        protected PhcMedicationService $phcMedicationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'phc_center_id',
            'medication_id',
            'is_active',
            'per_page',
        ]);

        $items = $this->phcMedicationService->getAllPhcMedications($filters);

        return $this->paginatedResponse($items, 'PHC medications retrieved successfully');
    }

    public function byCenter(Request $request, int $phcCenterId): JsonResponse
    {
        $filters = $request->only(['page', 'per_page', 'search', 'allocation_location']);
        $filters['phc_center_id'] = $phcCenterId;

        $items = $this->phcMedicationService->getAllPhcMedications($filters);

        // Aggregate stats for this center
        $totalLinked = PhcMedication::where('phc_center_id', $phcCenterId)->count();
        $totalRecommendedQty = PhcMedication::where('phc_center_id', $phcCenterId)->sum('recommended_quantity');
        $stockBelowRecommended = PhcMedication::where('phc_center_id', $phcCenterId)
            ->whereNotNull('current_stock')
            ->whereColumn('current_stock', '<', 'recommended_quantity')
            ->count();
        $uniqueLocations = PhcMedication::where('phc_center_id', $phcCenterId)
            ->whereNotNull('allocation_location')
            ->distinct('allocation_location')
            ->count('allocation_location');

        $extraMeta = [
            'total_linked' => $totalLinked,
            'total_recommended_qty' => (float) $totalRecommendedQty,
            'stock_below_recommended' => $stockBelowRecommended,
            'unique_locations' => $uniqueLocations,
        ];

        return $this->paginatedResponse($items, 'PHC medications retrieved successfully', $extraMeta);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phc_center_id' => 'required|integer|exists:phc_centers,id',
            'medication_id' => 'required|integer|exists:medications,id',
            'recommended_quantity' => 'required|numeric|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'allocation_location' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        if (isset($validated['allocation_location'])) {
            $validated['allocation_location'] = trim($validated['allocation_location']);
        }

        $item = $this->phcMedicationService->createPhcMedication($validated);

        return $this->successResponse($item, 'PHC medication linked successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $item = $this->phcMedicationService->getPhcMedicationById($id);

        if (! $item) {
            return $this->errorResponse('PHC medication not found', 404);
        }

        return $this->successResponse($item, 'PHC medication retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'recommended_quantity' => 'sometimes|numeric|min:0',
            'current_stock' => 'nullable|numeric|min:0',
            'allocation_location' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $item = $this->phcMedicationService->updatePhcMedication($id, $validated);

        return $this->successResponse($item, 'PHC medication updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->phcMedicationService->deletePhcMedication($id);

        if (! $deleted) {
            return $this->errorResponse('PHC medication not found', 404);
        }

        return $this->successResponse(null, 'PHC medication unlinked successfully');
    }

    public function template(): Response
    {
        $headers = [
            'PHC Center Name',
            'Medication Name',
            'Recommended Quantity',
            'Current Stock',
            'Allocation Location',
            'Notes',
        ];

        $sampleData = [
            ['Main Health Center', 'Paracetamol', 200, 50, 'Main Pharmacy', 'Monthly allocation'],
            ['Main Health Center', 'Amoxicillin', 100, 25, 'Pharmacy Room B', 'Emergency stock'],
            ['Downtown Clinic', 'Metformin', 150, null, 'Central Storage', 'Quarterly supply'],
        ];

        $filename = 'phc-medications-sample-'.str_replace(':', '-', now()->toIso8601String());

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

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
        ]);

        try {
            $import = new PhcMedicationImport;
            Excel::import($import, $request->file('file'));
            $importedCount = $import->getImportedCount();
            $skippedCount = $import->getSkippedCount();

            $message = "{$importedCount} records imported successfully";
            if ($skippedCount > 0) {
                $message .= " ({$skippedCount} records skipped)";
            }

            return $this->successResponse(['imported' => $importedCount], $message);
        } catch (ValidationException $e) {
            $errors = [];

            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = $message;
                }
            }

            return $this->errorResponse('Validation failed', 422, $errors);
        } catch (\Exception $e) {
            Log::error('Failed to import PHC medications', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->errorResponse('Import failed. Please check your file and try again.', 500);
        }
    }

    public function export(): Response
    {
        $filename = 'phc-medications-export-'.now()->format('Y-m-d_His');

        return Excel::download(new PhcMedicationExport, "{$filename}.xlsx");
    }
}
