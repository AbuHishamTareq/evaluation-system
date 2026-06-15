<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'admin' => 'System Administrator',
            'manager' => 'Center Manager',
            'evaluator' => 'Evaluation Officer',
            'staff' => 'General Staff',
        ];

        foreach ($roles as $name => $description) {
            Role::firstOrCreate(
                ['name' => $name],
                ['description' => $description, 'guard_name' => 'web']
            );
        }

        $permissions = [
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
            'staff.view',
            'staff.create',
            'staff.update',
            'staff.delete',
            'centers.view',
            'centers.create',
            'centers.update',
            'centers.delete',
            'questions.view',
            'questions.create',
            'questions.update',
            'questions.delete',
            'evaluations.view',
            'evaluations.create',
            'evaluations.update',
            'evaluations.delete',
            'reports.view',
            'reports.export',
            'settings.manage',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(
                ['name' => $name],
                ['description' => str_replace('.', ' ', ucfirst($name)), 'guard_name' => 'web']
            );
        }

        $adminRole = Role::where('name', 'admin')->first();
        $adminPermissions = Permission::all();
        $adminRole->permissions()->sync($adminPermissions->pluck('id'));

        $managerRole = Role::where('name', 'manager')->first();
        $managerPermissions = Permission::whereIn('name', [
            'staff.view', 'staff.create', 'staff.update',
            'centers.view', 'centers.create', 'centers.update',
            'evaluations.view', 'evaluations.create', 'evaluations.update',
            'reports.view', 'reports.export',
        ])->get();
        $managerRole->permissions()->sync($managerPermissions->pluck('id'));
    }
}
