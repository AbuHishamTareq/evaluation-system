<?php

namespace App\Features\RolesAndPermissions\Services;

class PermissionRegistryService
{
    /**
     * Get all system permissions - this is the source of truth.
     *
     * @return array<string, string> permission name => description
     */
    public function getAll(): array
    {
        return [
            // Staff module
            'staff.view' => 'View staff list and details',
            'staff.create' => 'Create new staff members',
            'staff.edit' => 'Edit existing staff members',
            'staff.delete' => 'Delete staff members',
            'staff.export' => 'Export staff data',
            'staff.import' => 'Import staff data',
            'staff.activate' => 'Activate/deactivate staff',
            'staff.view_history' => 'View staff deactivation history',
            'staff.export_cv' => 'Export staff CV',

            // Centers module
            'centers.view' => 'View centers list and details',
            'centers.create' => 'Create new centers',
            'centers.edit' => 'Edit existing centers',
            'centers.delete' => 'Delete centers',
            'centers.export' => 'Export center data',
            'centers.import' => 'Import center data',
            'centers.activate' => 'Activate/deactivate centers',
            'centers.view_staff' => 'View staff assigned to a center',

            // Roles & Permissions module
            'roles.view' => 'View roles list and details',
            'roles.create' => 'Create new roles',
            'roles.edit' => 'Edit existing roles',
            'roles.delete' => 'Delete roles',
            'roles.assign_permissions' => 'Assign permissions to roles',
            'roles.assign_users' => 'Assign roles to users',
            'permissions.view' => 'View permissions list',
            'permissions.create' => 'Create permissions',
            'permissions.edit' => 'Edit permissions',
            'permissions.delete' => 'Delete permissions',

            // Zones module
            'zones.view' => 'View zones',
            'zones.create' => 'Create zones',
            'zones.edit' => 'Edit zones',
            'zones.delete' => 'Delete zones',
            'zones.export' => 'Export zones',
            'zones.import' => 'Import zones',

            // Departments module
            'departments.view' => 'View departments',
            'departments.create' => 'Create departments',
            'departments.edit' => 'Edit departments',
            'departments.delete' => 'Delete departments',

            // Action Plans module
            'action-plans.view' => 'View action plans',
            'action-plans.create' => 'Create action plans',
            'action-plans.edit' => 'Edit action plans',
            'action-plans.delete' => 'Delete action plans',

            // Evaluations module
            'evaluations.view' => 'View evaluations',
            'evaluations.create' => 'Create evaluations',
            'evaluations.edit' => 'Edit evaluations',
            'evaluations.delete' => 'Delete evaluations',
            'evaluations.submit' => 'Submit evaluations',
            'evaluations.approve' => 'Approve evaluations',

            // Analytics & Reports
            'reports.view' => 'View reports and analytics',
            'reports.export' => 'Export reports',

            // Users / Settings
            'users.view' => 'View users',
            'users.manage' => 'Manage users (create/edit/delete)',
            'settings.view' => 'View system settings',
            'settings.manage' => 'Manage system settings',

            // Professionals module
            'professionals.view' => 'View professionals',
            'professionals.create' => 'Create professionals',
            'professionals.edit' => 'Edit professionals',
            'professionals.delete' => 'Delete professionals',

            // Educational Degrees module
            'educational-degrees.view' => 'View educational degrees',
            'educational-degrees.create' => 'Create educational degrees',
            'educational-degrees.edit' => 'Edit educational degrees',
            'educational-degrees.delete' => 'Delete educational degrees',

            // Clinic Assignments module
            'clinic-assignments.view' => 'View clinic assignments',
            'clinic-assignments.create' => 'Create clinic assignments',
            'clinic-assignments.edit' => 'Edit clinic assignments',
            'clinic-assignments.delete' => 'Delete clinic assignments',

            // Team Codes module
            'team-codes.view' => 'View team codes',
            'team-codes.create' => 'Create team codes',
            'team-codes.edit' => 'Edit team codes',
            'team-codes.delete' => 'Delete team codes',
            'team-codes.export' => 'Export team codes',
            'team-codes.import' => 'Import team codes',

            // Questions module
            'questions.view' => 'View questions',
            'questions.create' => 'Create questions',
            'questions.edit' => 'Edit questions',
            'questions.delete' => 'Delete questions',

            // Question Categories module
            'question-categories.view' => 'View question categories',
            'question-categories.create' => 'Create question categories',
            'question-categories.edit' => 'Edit question categories',
            'question-categories.delete' => 'Delete question categories',

            // Question Sub-Categories module
            'question-sub-categories.view' => 'View question sub-categories',
            'question-sub-categories.create' => 'Create question sub-categories',
            'question-sub-categories.edit' => 'Edit question sub-categories',
            'question-sub-categories.delete' => 'Delete question sub-categories',

            // Templates module
            'templates.view' => 'View templates',
            'templates.create' => 'Create templates',
            'templates.edit' => 'Edit templates',
            'templates.delete' => 'Delete templates',
            'templates.toggle' => 'Toggle template status',

            // Fields module
            'fields.view' => 'View fields',
            'fields.create' => 'Create fields',
            'fields.edit' => 'Edit fields',
            'fields.delete' => 'Delete fields',
            'fields.export' => 'Export fields',
            'fields.import' => 'Import fields',

            // Specialties module
            'specialties.view' => 'View specialties',
            'specialties.create' => 'Create specialties',
            'specialties.edit' => 'Edit specialties',
            'specialties.delete' => 'Delete specialties',
            'specialties.export' => 'Export specialties',
            'specialties.import' => 'Import specialties',

            // Ranks module
            'ranks.view' => 'View ranks',
            'ranks.create' => 'Create ranks',
            'ranks.edit' => 'Edit ranks',
            'ranks.delete' => 'Delete ranks',
            'ranks.export' => 'Export ranks',
            'ranks.import' => 'Import ranks',

            // Categories module
            'categories.view' => 'View categories',
            'categories.create' => 'Create categories',
            'categories.edit' => 'Edit categories',
            'categories.delete' => 'Delete categories',
            'categories.export' => 'Export categories',
            'categories.import' => 'Import categories',

            // Classifications (mappings) module
            'classifications.view' => 'View classification mappings',
            'classifications.create' => 'Create classification mappings',
            'classifications.edit' => 'Edit classification mappings',
            'classifications.delete' => 'Delete classification mappings',
            'classifications.export' => 'Export classification mappings',
            'classifications.import' => 'Import classification mappings',

            // Medications module
            'medications.view' => 'View medications',
            'medications.create' => 'Create medications',
            'medications.edit' => 'Edit medications',
            'medications.delete' => 'Delete medications',
            'medications.export' => 'Export medication data',
            'medications.import' => 'Import medication data',
            'phc-medications.import' => 'Import PHC medication links',
            'phc-medications.export' => 'Export PHC medication links',

            // Medication Evaluation Templates module
            'medication-eval-templates.view' => 'View medication evaluation templates',
            'medication-eval-templates.create' => 'Create medication evaluation templates',
            'medication-eval-templates.edit' => 'Edit medication evaluation templates',
            'medication-eval-templates.delete' => 'Delete medication evaluation templates',

            // Medication Evaluations module
            'medication-evaluations.view' => 'View medication evaluations',
            'medication-evaluations.create' => 'Create medication evaluations',
            'medication-evaluations.edit' => 'Edit medication evaluations',
            'medication-evaluations.delete' => 'Delete medication evaluations',
        ];
    }

    /**
     * Get permission names only.
     *
     * @return array<int, string>
     */
    public function getNames(): array
    {
        return array_keys($this->getAll());
    }
}
