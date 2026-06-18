<?php

namespace App\Features\Users\Controllers;

use App\Features\Users\Exports\UserExport;
use App\Features\Users\Imports\UserImport;
use App\Features\Users\Requests\StoreUserRequest;
use App\Features\Users\Requests\UpdateUserRequest;
use App\Features\Users\Services\UserService;
use App\Http\Controllers\Api\V1\BaseApiController;
use App\Models\User;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * @group Users
 *
 * APIs for managing system users.
 */
class UserController extends BaseApiController
{
    public function __construct(
        protected UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'role', 'is_active', 'per_page', 'sort_field', 'sort_direction']);
        $users = $this->userService->getAllUsers($filters);

        return $this->paginatedResponse($users, 'Users retrieved successfully');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return $this->successResponse($user, 'User created successfully', 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->errorResponse('User not found', 404);
        }

        return $this->successResponse($user, 'User retrieved successfully');
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);

        if (! $user) {
            return $this->errorResponse('User not found', 404);
        }

        $user = $this->userService->updateUser($id, $request->validated());

        return $this->successResponse($user, 'User updated successfully');
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->userService->deleteUser($id);

        if (! $deleted) {
            return $this->errorResponse('User not found', 404);
        }

        return $this->successResponse(null, 'User deleted successfully');
    }

    public function toggleActive(int $id): JsonResponse
    {
        $user = $this->userService->toggleActive($id);

        if (! $user) {
            return $this->errorResponse('User not found', 404);
        }

        $message = $user->is_active ? 'User activated successfully' : 'User deactivated successfully';

        return $this->successResponse($user, $message);
    }

    public function export(Request $request): Response|BinaryFileResponse
    {
        $filters = $request->only(['search', 'role', 'is_active']);
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
            new UserExport($filters),
            'users_export_'.now()->format('Y-m-d_His').'.'.$extension,
            $writerType
        );
    }

    protected function exportPdf(array $filters): Response
    {
        $query = User::query()->with('roles');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->orderBy('name')->get();

        $html = view('exports.users_pdf', [
            'users' => $users,
            'generatedAt' => now()->format('d F Y, h:i A'),
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

        $filename = 'users_export_'.now()->format('Y-m-d_His');

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
            $import = new UserImport;
            Excel::import($import, $request->file('file'));
            $count = $import->getImportedCount();

            $message = $count > 0
                ? "{$count} record(s) imported successfully"
                : 'No new records imported. All user records already exist in the database.';

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
            return $this->errorResponse('Failed to import users: '.$e->getMessage(), 500);
        }
    }
}
