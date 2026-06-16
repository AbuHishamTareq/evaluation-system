<?php

namespace Database\Seeders;

use App\Features\RolesAndPermissions\Services\PermissionRegistryService;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /** @var PermissionRegistryService $registry */
        $registry = app(PermissionRegistryService::class);

        // Insert all permissions from the registry
        foreach ($registry->getAll() as $name => $description) {
            Permission::updateOrCreate(
                ['name' => $name],
                ['description' => $description, 'guard_name' => 'web']
            );
        }

        $allPermissionIds = Permission::pluck('id');

        // Define role configurations
        $roles = [
            'Super Admin' => 'Full system access with all permissions',
            'Manager' => 'Center management and staff oversight',
            'Evaluator' => 'Evaluation management and submission',
            'Staff' => 'Basic view-only access for staff members',
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(
                ['name' => $name],
                ['description' => $description, 'guard_name' => 'web']
            );
        }

        $superAdminRole = Role::where('name', 'Super Admin')->first();
        $superAdminRole->permissions()->sync($allPermissionIds);

        $managerRole = Role::where('name', 'Manager')->first();
        $managerPermissions = Permission::whereIn('name', [
            'staff.view', 'staff.create', 'staff.edit', 'staff.activate', 'staff.view_history',
            'centers.view', 'centers.create', 'centers.edit', 'centers.activate', 'centers.view_staff',
            'evaluations.view', 'evaluations.create', 'evaluations.edit', 'evaluations.submit',
            'reports.view', 'reports.export',
            'users.view',
            'zones.view',
            'departments.view',
            'roles.view',
            'permissions.view',
            'questions.view', 'questions.create', 'questions.edit', 'questions.delete',
            'question-categories.view', 'question-categories.create', 'question-categories.edit', 'question-categories.delete',
            'question-sub-categories.view', 'question-sub-categories.create', 'question-sub-categories.edit', 'question-sub-categories.delete',
        ])->pluck('id');
        $managerRole->permissions()->sync($managerPermissions);

        $evaluatorRole = Role::where('name', 'Evaluator')->first();
        $evaluatorPermissions = Permission::whereIn('name', [
            'staff.view',
            'evaluations.view', 'evaluations.create', 'evaluations.edit', 'evaluations.submit',
            'centers.view',
            'reports.view',
            'questions.view',
            'question-categories.view',
            'question-sub-categories.view',
        ])->pluck('id');
        $evaluatorRole->permissions()->sync($evaluatorPermissions);

        $staffRole = Role::where('name', 'Staff')->first();
        $staffPermissions = Permission::whereIn('name', [
            'staff.view',
            'evaluations.view',
            'questions.view',
            'question-categories.view',
            'question-sub-categories.view',
        ])->pluck('id');
        $staffRole->permissions()->sync($staffPermissions);

        $this->command?->info('Roles & Permissions seeded successfully.');
    }
}
