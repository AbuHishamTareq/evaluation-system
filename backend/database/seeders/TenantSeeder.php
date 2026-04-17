<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\PhcCenter;
use App\Models\Region;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::create([
            'name' => 'Saudi Arabia PHC',
            'slug' => 'saudi-phc',
            'country' => 'SA',
            'timezone' => 'Asia/Riyadh',
            'locale' => 'en',
            'is_active' => true,
        ]);

        $region = Region::create([
            'tenant_id' => $tenant->id,
            'name' => 'Riyadh Region',
            'name_ar' => 'منطقة الرياض',
            'code' => 'RIY',
            'is_active' => true,
        ]);

        $phc = PhcCenter::create([
            'tenant_id' => $tenant->id,
            'region_id' => $region->id,
            'name' => 'North Riyadh PHC',
            'name_ar' => 'مركز شمال الرياض الصحي',
            'code' => 'NR-PHC-001',
            'address' => 'Kingdom Avenue, Riyadh',
            'phone' => '+966-11-123-4567',
            'is_active' => true,
        ]);

        $dept = Department::create([
            'phc_center_id' => $phc->id,
            'name' => 'Nursing Department',
            'name_ar' => 'قسم التمريض',
            'code' => 'NURS',
            'is_active' => true,
        ]);

        $roles = ['Main Office', 'Regional Supervisor', 'PHC Manager', 'Head Nurse', 'Staff Nurse', 'QA Officer', 'HR Administrator', 'Doctor'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        $admin = User::create([
            'tenant_id' => $tenant->id,
            'phc_center_id' => $phc->id,
            'department_id' => $dept->id,
            'name' => 'Admin User',
            'email' => 'admin@phc.sa',
            'password' => Hash::make('password123'),
        ]);
        $admin->assignRole('Main Office');

        $manager = User::create([
            'tenant_id' => $tenant->id,
            'phc_center_id' => $phc->id,
            'department_id' => $dept->id,
            'name' => 'PHC Manager',
            'email' => 'manager@phc.sa',
            'password' => Hash::make('password123'),
        ]);
        $manager->assignRole('PHC Manager');

        $nurse = User::create([
            'tenant_id' => $tenant->id,
            'phc_center_id' => $phc->id,
            'department_id' => $dept->id,
            'name' => 'Staff Nurse',
            'email' => 'nurse@phc.sa',
            'password' => Hash::make('password123'),
        ]);
        $nurse->assignRole('Staff Nurse');

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('Login: admin@phc.sa / password123');
        $this->command->info('Login: manager@phc.sa / password123');
        $this->command->info('Login: nurse@phc.sa / password123');
    }
}
