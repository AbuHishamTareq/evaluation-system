<?php

namespace App\Features\Zones\Controllers;

use App\Features\Zones\Exports\ZoneExport;
use App\Features\Zones\Imports\ZoneImport;
use App\Features\Zones\Services\ZoneService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\Zone;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Zones
 *
 * APIs for managing geographic zones and their hierarchical structure.
 */
class ZoneController extends BaseApiController
{
    public function __construct(
        protected ZoneService $zoneService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'level', 'parent_id', 'per_page']);
        $zones = $this->zoneService->getAllZones($filters);

        return $this->paginatedResponse($zones, 'Zones retrieved successfully');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code',
            'parent_id' => 'nullable|integer|exists:zones,id',
            'level' => 'required|string|in:region,district,sub_district',
            'description' => 'nullable|string',
        ]);

        $zone = $this->zoneService->createZone($validated);

        return $this->successResponse($zone, 'Zone created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $zone = $this->zoneService->getZoneById($id);

        if (! $zone) {
            return $this->errorResponse('Zone not found', 404);
        }

        return $this->successResponse($zone, 'Zone retrieved successfully');
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:zones,code,'.$id,
            'parent_id' => 'nullable|integer|exists:zones,id',
            'level' => 'sometimes|string|in:region,district,sub_district',
            'description' => 'nullable|string',
        ]);

        $zone = $this->zoneService->updateZone($id, $validated);

        return $this->successResponse($zone, 'Zone updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->zoneService->deleteZone($id);

        if (! $deleted) {
            return $this->errorResponse('Zone not found', 404);
        }

        return $this->successResponse(null, 'Zone deleted successfully');
    }

    public function tree(): JsonResponse
    {
        $tree = $this->zoneService->getZoneTree();

        return $this->successResponse($tree, 'Zone tree retrieved successfully');
    }

    public function roots(): JsonResponse
    {
        $roots = $this->zoneService->getRootZones();

        return $this->successResponse($roots, 'Root zones retrieved successfully');
    }

    public function children(int $parentId): JsonResponse
    {
        $children = $this->zoneService->getChildren($parentId);

        return $this->successResponse($children, 'Child zones retrieved successfully');
    }

    public function byLevel(string $level): JsonResponse
    {
        $zones = $this->zoneService->getZonesByLevel($level);

        return $this->successResponse($zones, 'Zones retrieved successfully');
    }

    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->get('q', '');

        if (strlen($searchTerm) < 2) {
            return $this->errorResponse('Search term must be at least 2 characters', 400);
        }

        $results = $this->zoneService->searchZones($searchTerm);

        return $this->successResponse($results, 'Search results retrieved successfully');
    }

    public function centers(int $id): JsonResponse
    {
        $zone = $this->zoneService->getZonesWithCenters($id);

        if (! $zone) {
            return $this->errorResponse('Zone not found', 404);
        }

        return $this->successResponse($zone->centers, 'Centers retrieved successfully');
    }

    public function hierarchy(int $id): JsonResponse
    {
        $zone = $this->zoneService->getZoneById($id);

        if (! $zone) {
            return $this->errorResponse('Zone not found', 404);
        }

        $hierarchy = $this->zoneService->getZoneHierarchy($id);

        return $this->successResponse($hierarchy, 'Zone hierarchy retrieved successfully');
    }

    public function export(Request $request): Response
    {
        $format = $request->get('format', 'xlsx');
        $format = strtolower($format);

        $validFormats = ['csv', 'xlsx', 'pdf'];
        if (! in_array($format, $validFormats)) {
            return $this->errorResponse('Invalid format. Valid formats: '.implode(', ', $validFormats), 400);
        }

        $filename = 'zones_'.now()->format('Y-m-d_His');

        if ($format === 'pdf') {
            return $this->exportPdf($filename);
        }

        $extension = $format === 'xlsx' ? 'xlsx' : 'csv';

        return Excel::download(new ZoneExport($format), "{$filename}.{$extension}");
    }

    protected function exportPdf(string $filename): Response
    {
        $zones = Zone::with('parent')->get();

        $html = view('exports.zones_pdf', [
            'zones' => $zones,
            'generatedAt' => now()->toIso8601String(),
        ])->render();

        $options = new Options;
        $options->set('isRemoteEnabled', false);
        $options->set('isPhpEnabled', false);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        return response($dompdf->output(), 200, [
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
            $import = new ZoneImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            return $this->successResponse(null, $count.' records imported successfully');
        } catch (ValidationException $e) {
            $errors = [];

            foreach ($e->errors() as $field => $messages) {
                foreach ($messages as $message) {
                    $errors[] = $message;
                }
            }

            return $this->errorResponse('Validation failed', 422, $errors);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to import zones: '.$e->getMessage(), 500);
        }
    }
}
