<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Users & Roles
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'roles.view',
            'roles.create',
            'roles.edit',
            'roles.delete',

            // Staff Management
            'staff.view',
            'staff.create',
            'staff.edit',
            'staff.delete',
            'shifts.view',
            'shifts.create',
            'shifts.approve',
            'shift_requests.view',
            'shift_requests.approve',

            // Incidents
            'incidents.view',
            'incidents.create',
            'incidents.edit',
            'incidents.close',
            'incidents.view_all',

            // Medications
            'medications.view',
            'medications.create',
            'medications.edit',
            'medications.administrate',
            'medications.view_all',

            // Evaluations
            'evaluations.view',
            'evaluations.create',
            'evaluations.edit',
            'evaluations.delete',
            'evaluations.assign',
            'action_plans.view',
            'action_plans.create',
            'action_plans.edit',

            // Issues
            'issues.view',
            'issues.create',
            'issues.edit',
            'issues.assign',
            'issues.close',
            'issues.view_all',

            // Reports
            'reports.view',
            'reports.export',
            'reports.view_all',

            // Settings
            'settings.view',
            'settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $rolesConfig = [
            'Main Office' => Permission::all()->pluck('id')->toArray(),
            'Regional Supervisor' => [
                'staff.view', 'staff.edit',
                'shifts.view', 'shifts.create', 'shift_requests.view', 'shift_requests.approve',
                'incidents.view', 'incidents.edit', 'incidents.view_all',
                'medications.view', 'medications.edit', 'medications.view_all',
                'evaluations.view', 'evaluations.create', 'evaluations.assign', 'action_plans.view', 'action_plans.create',
                'issues.view', 'issues.edit', 'issues.assign', 'issues.view_all',
                'reports.view', 'reports.export', 'reports.view_all',
            ],
            'PHC Manager' => [
                'staff.view', 'staff.create', 'staff.edit',
                'shifts.view', 'shifts.create', 'shift_requests.view', 'shift_requests.approve',
                'incidents.view', 'incidents.create', 'incidents.edit', 'incidents.close',
                'medications.view', 'medications.create', 'medications.edit', 'medications.administrate',
                'evaluations.view', 'evaluations.create', 'evaluations.edit', 'evaluations.assign',
                'action_plans.view', 'action_plans.create', 'action_plans.edit',
                'issues.view', 'issues.create', 'issues.edit', 'issues.assign', 'issues.close',
                'reports.view', 'reports.export',
            ],
            'Head Nurse' => [
                'staff.view',
                'shifts.view', 'shifts.create', 'shift_requests.view',
                'incidents.view', 'incidents.create',
                'medications.view', 'medications.administrate',
                'evaluations.view', 'evaluations.create',
                'action_plans.view',
                'issues.view', 'issues.create',
                'reports.view',
            ],
            'Staff Nurse' => [
                'staff.view',
                'shifts.view',
                'incidents.view', 'incidents.create',
                'medications.view', 'medications.administrate',
                'evaluations.view',
                'action_plans.view',
                'issues.view', 'issues.create',
            ],
            'QA Officer' => [
                'staff.view',
                'incidents.view', 'incidents.create', 'incidents.edit', 'incidents.close', 'incidents.view_all',
                'evaluations.view', 'evaluations.create', 'evaluations.edit',
                'action_plans.view', 'action_plans.create', 'action_plans.edit',
                'issues.view', 'issues.edit',
                'reports.view', 'reports.export',
            ],
            'HR Administrator' => [
                'staff.view', 'staff.create', 'staff.edit',
                'shifts.view', 'shifts.create',
                'shift_requests.view', 'shift_requests.approve',
                'reports.view', 'reports.export',
            ],
            'Doctor' => [
                'staff.view',
                'incidents.view', 'incidents.create',
                'medications.view', 'medications.administrate',
                'evaluations.view',
                'issues.view',
                'reports.view',
            ],
        ];

        foreach ($rolesConfig as $roleName => $perms) {
            $role = Role::where('name', $roleName)->first();
            if ($role) {
                $role->syncPermissions($perms);
            }
        }

        $this->command->info('Permissions seeded successfully!');
    }
}
