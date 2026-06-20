<?php

namespace App\Features\Centers\Controllers;

use App\Features\Centers\Exports\CenterExport;
use App\Features\Centers\Imports\CenterImport;
use App\Features\Centers\Services\CenterService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\PhcCenter;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
 * @group Centers
 *
 * APIs for managing PHC centers, including CRUD, import/export, and statistics.
 */
class CenterController extends BaseApiController
{
    public function __construct(
        protected CenterService $centerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'zone_id',
            'classification',
            'is_active',
            'per_page',
        ]);

        $centers = $this->centerService->getAllCenters($filters);

        return $this->paginatedResponse($centers, 'Centers retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:phc_centers,code',
            'zone_id' => 'nullable|integer|exists:zones,id',
            'classification' => 'nullable|string|in:primary,secondary,specialized,community',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'region' => 'nullable|string|max:255',
            'zone' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $center = $this->centerService->createCenter($validated);

        return $this->successResponse($center, 'Center created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $center = $this->centerService->getCenterById($id);

        if (! $center) {
            return $this->errorResponse('Center not found', 404);
        }

        return $this->successResponse($center, 'Center retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:phc_centers,code,'.$id,
            'zone_id' => 'nullable|integer|exists:zones,id',
            'classification' => 'sometimes|string|in:primary,secondary,specialized,community',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|min:-90|max:90',
            'longitude' => 'nullable|numeric|min:-180|max:180',
            'region' => 'nullable|string|max:255',
            'zone' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $center = $this->centerService->updateCenter($id, $validated);

        return $this->successResponse($center, 'Center updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->centerService->deleteCenter($id);

        if (! $deleted) {
            return $this->errorResponse('Center not found', 404);
        }

        return $this->successResponse(null, 'Center deleted successfully');
    }

    public function active(Request $request): JsonResponse
    {
        $zoneId = $request->integer('zone_id') ?: null;
        $centers = $this->centerService->getActiveCenters($zoneId);

        return $this->successResponse($centers, 'Active centers retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->centerService->searchCenters($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function statistics(int $id): JsonResponse
    {
        $stats = $this->centerService->getCenterStatistics($id);

        if (empty($stats)) {
            return $this->errorResponse('Center not found', 404);
        }

        return $this->successResponse($stats, 'Center statistics retrieved successfully');
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $center = $this->centerService->updateCenter($id, $validated);

        return $this->successResponse($center, 'Center status updated successfully');
    }

    public function byZone(int $zoneId): JsonResponse
    {
        $centers = $this->centerService->getCentersByZone($zoneId);

        return $this->successResponse($centers, 'Centers retrieved successfully');
    }

    public function byClassification(string $classification): JsonResponse
    {
        $centers = $this->centerService->getCentersByClassification($classification);

        return $this->successResponse($centers, 'Centers retrieved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filters = $request->only(['search', 'zone_id', 'classification', 'is_active']);
        $filename = 'centers_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename, $filters);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new CenterExport($format, $filters), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename, array $filters): Response
    {
        $query = PhcCenter::query()->with('zone');

        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                    ->orWhere('code', 'like', "%{$filters['search']}%");
            });
        }

        if (! empty($filters['zone_id'])) {
            $query->where('zone_id', $filters['zone_id']);
        }

        if (! empty($filters['classification'])) {
            $query->where('classification', $filters['classification']);
        }

        $centers = $query->orderBy('name')->get();

        $html = view('exports.centers_pdf', [
            'centers' => $centers,
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
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        try {
            $import = new CenterImport;
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
            return $this->errorResponse('Failed to import centers: '.$e->getMessage(), 500);
        }
    }

    public function template(): Response
    {
        $headers = [
            'Center Name',
            'Center Code',
            'Zone Name',
            'Classification',
            'Address',
            'Phone',
            'Email',
            'Is Active',
            'Notes',
            'Region',
            'Zone',
            'Latitude',
            'Longitude',
        ];

        $sampleData = [
            [
                'Sample Health Center 1',
                'SHC001',
                'Central Zone',
                'Level 1',
                '123 Main Street, City',
                '+1234567890',
                'shc001@example.com',
                'Yes',
                'Sample notes',
                'Central Region',
                'Central',
                '40.7128',
                '-74.0060',
            ],
            [
                'Sample Health Center 2',
                'SHC002',
                'North Zone',
                'Level 2+',
                '456 North Ave, Town',
                '+1234567891',
                'shc002@example.com',
                'Yes',
                '',
                'Northern Region',
                'North',
                '41.8781',
                '-87.6298',
            ],
        ];

        $filename = 'center_import_template';

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
