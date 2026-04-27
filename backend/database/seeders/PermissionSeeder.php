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
            // System Features
            'alerts.view',
            'audit_logs.view',
            'dashboard.view',
            'exports.generate',
            'exports.view',
            'imports.process',
            'imports.view',

            // HR Reference Data
            'departments.create',
            'departments.delete',
            'departments.edit',
            'departments.view',
            'medical_fields.create',
            'medical_fields.delete',
            'medical_fields.edit',
            'medical_fields.view',
            'nationalities.create',
            'nationalities.delete',
            'nationalities.edit',
            'nationalities.view',
            'phc_centers.create',
            'phc_centers.delete',
            'phc_centers.edit',
            'phc_centers.view',
            'ranks.create',
            'ranks.delete',
            'ranks.edit',
            'ranks.view',
            'shc_categories.create',
            'shc_categories.delete',
            'shc_categories.edit',
            'shc_categories.view',
            'specialties.create',
            'specialties.delete',
            'specialties.edit',
            'specialties.view',
            'zones.create',
            'zones.delete',
            'zones.edit',
            'zones.view',

            // Medications
            'medication_alerts.resolve',
            'medication_alerts.view',
            'medication_batches.create',
            'medication_batches.delete',
            'medication_batches.edit',
            'medication_batches.view',
            'medication_logs.create',
            'medication_logs.delete',
            'medication_logs.edit',
            'medication_logs.view',
            'medications.administrate',
            'medications.create',
            'medications.delete',
            'medications.edit',
            'medications.view',
            'medications.view_all',

            // Evaluations
            'action_plans.create',
            'action_plans.edit',
            'action_plans.view',
            'evaluation_templates.create',
            'evaluation_templates.delete',
            'evaluation_templates.edit',
            'evaluation_templates.view',
            'evaluations.assign',
            'evaluations.create',
            'evaluations.delete',
            'evaluations.edit',
            'evaluations.view',

            // Incidents
            'incidents.close',
            'incidents.create',
            'incidents.edit',
            'incidents.view',
            'incidents.view_all',

            // Issues
            'issues.assign',
            'issues.close',
            'issues.create',
            'issues.edit',
            'issues.view',
            'issues.view_all',

            // Reports
            'reports.export',
            'reports.view',
            'reports.view_all',

            // Roles
            'roles.create',
            'roles.delete',
            'roles.edit',
            'roles.import_export',
            'roles.toggle',
            'roles.view',

            // Departments
            'departments.create',
            'departments.delete',
            'departments.edit',
            'departments.import_export',
            'departments.toggle',
            'departments.view',

            // Zones
            'zones.create',
            'zones.delete',
            'zones.edit',
            'zones.import_export',
            'zones.toggle',
            'zones.view',

            // Phc Centers
            'phc_centers.create',
            'phc_centers.delete',
            'phc_centers.edit',
            'phc_centers.import_export',
            'phc_centers.toggle',
            'phc_centers.view',

            // Nationalities
            'nationalities.create',
            'nationalities.delete',
            'nationalities.edit',
            'nationalities.import_export',
            'nationalities.toggle',
            'nationalities.view',

            // Medical Fields
            'medical_fields.create',
            'medical_fields.delete',
            'medical_fields.edit',
            'medical_fields.import_export',
            'medical_fields.toggle',
            'medical_fields.view',

            // Specialties
            'specialties.create',
            'specialties.delete',
            'specialties.edit',
            'specialties.import_export',
            'specialties.toggle',
            'specialties.view',

            // Ranks
            'ranks.create',
            'ranks.delete',
            'ranks.edit',
            'ranks.import_export',
            'ranks.toggle',
            'ranks.view',

            // Shc Categories
            'shc_categories.create',
            'shc_categories.delete',
            'shc_categories.edit',
            'shc_categories.import_export',
            'shc_categories.toggle',
            'shc_categories.view',

            // Team Based Codes
            'team_based_codes.create',
            'team_based_codes.delete',
            'team_based_codes.edit',
            'team_based_codes.import_export',
            'team_based_codes.toggle',
            'team_based_codes.view',

            // Settings
            'settings.edit',
            'settings.view',

            // Shift Requests
            'shift_requests.approve',
            'shift_requests.view',

            // Shifts
            'shifts.approve',
            'shifts.create',
            'shifts.view',

            // Staff Management
            'staff.create',
            'staff.delete',
            'staff.edit',
            'staff.import_export',
            'staff.toggle',
            'staff.view',

            // Users
            'users.create',
            'users.delete',
            'users.edit',
            'users.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $rolesConfig = [
            'Main Office' => Permission::all()->pluck('id')->toArray(),
            'Regional Supervisor' => [
                'staff.view', 'staff.edit', 'staff.import_export',
                'shifts.view', 'shifts.create', 'shift_requests.view', 'shift_requests.approve',
                'departments.view', 'zones.view', 'phc_centers.view', 'nationalities.view',
                'medical_fields.view', 'specialties.view', 'ranks.view', 'shc_categories.view',
                'incidents.view', 'incidents.edit', 'incidents.view_all',
                'medications.view', 'medications.edit', 'medications.view_all',
                'evaluations.view', 'evaluations.create', 'evaluations.assign', 'action_plans.view', 'action_plans.create',
                'issues.view', 'issues.edit', 'issues.assign', 'issues.view_all',
                'reports.view', 'reports.export', 'reports.view_all',
                'alerts.view', 'audit_logs.view', 'dashboard.view',
            ],
            'PHC Manager' => [
                'staff.view', 'staff.create', 'staff.edit', 'staff.import_export',
                'shifts.view', 'shifts.create', 'shift_requests.view', 'shift_requests.approve',
                'departments.view', 'departments.create', 'departments.edit',
                'zones.view', 'zones.create', 'zones.edit',
                'phc_centers.view', 'phc_centers.create', 'phc_centers.edit',
                'nationalities.view', 'nationalities.create', 'nationalities.edit',
                'medical_fields.view', 'medical_fields.create', 'medical_fields.edit',
                'specialties.view', 'specialties.create', 'specialties.edit',
                'ranks.view', 'ranks.create', 'ranks.edit',
                'shc_categories.view', 'shc_categories.create', 'shc_categories.edit',
                'incidents.view', 'incidents.create', 'incidents.edit', 'incidents.close',
                'medications.view', 'medications.create', 'medications.edit', 'medications.administrate',
                'evaluations.view', 'evaluations.create', 'evaluations.edit', 'evaluations.assign',
                'evaluation_templates.view', 'evaluation_templates.create',
                'action_plans.view', 'action_plans.create', 'action_plans.edit',
                'issues.view', 'issues.create', 'issues.edit', 'issues.assign', 'issues.close',
                'reports.view', 'reports.export',
                'alerts.view', 'dashboard.view',
                'imports.view', 'imports.process',
                'exports.view', 'exports.generate',
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
                'alerts.view',
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
                'evaluation_templates.view', 'evaluation_templates.create', 'evaluation_templates.edit',
                'action_plans.view', 'action_plans.create', 'action_plans.edit',
                'issues.view', 'issues.edit',
                'reports.view', 'reports.export',
                'audit_logs.view',
            ],
            'HR Administrator' => [
                'staff.view', 'staff.create', 'staff.edit', 'staff.import_export',
                'shifts.view', 'shifts.create',
                'shift_requests.view', 'shift_requests.approve',
                'departments.view', 'departments.create', 'departments.edit',
                'zones.view', 'zones.create', 'zones.edit',
                'phc_centers.view', 'phc_centers.create', 'phc_centers.edit',
                'nationalities.view', 'nationalities.create', 'nationalities.edit',
                'medical_fields.view', 'medical_fields.create', 'medical_fields.edit',
                'specialties.view', 'specialties.create', 'specialties.edit',
                'ranks.view', 'ranks.create', 'ranks.edit',
                'shc_categories.view', 'shc_categories.create', 'shc_categories.edit',
                'reports.view', 'reports.export',
                'imports.view', 'imports.process',
                'exports.view', 'exports.generate',
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
