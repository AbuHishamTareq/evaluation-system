<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            ZoneSeeder::class,
        ]);

        $admin = User::firstOrCreate(
            ['email' => 'admin@phc.gov'],
            [
                'name' => 'System Administrator',
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'is_active' => true,
                'employee_id' => 'ADMIN001',
            ]
        );

        // Ensure admin has Super Admin pivot role
        $superAdminRole = Role::where('name', 'Super Admin')->first();
        if ($superAdminRole && $admin->roles()->count() === 0) {
            $admin->roles()->sync([$superAdminRole->id]);
        }
    }
}
