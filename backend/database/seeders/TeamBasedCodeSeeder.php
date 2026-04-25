<?php

namespace Database\Seeders;

use App\Models\TeamBasedCode;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TeamBasedCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $codes = [
            ['code' => 'TBC-001', 'role' => 'Team Leader'],
            ['code' => 'TBC-002', 'role' => 'Health Coach'],
            ['code' => 'TBC-003', 'role' => 'Member'],
            ['code' => 'TBC-004', 'role' => 'Supervisor'],
            ['code' => 'TBC-005', 'role' => 'Coordinator'],
        ];

        foreach ($codes as $codeData) {
            TeamBasedCode::create($codeData);
        }
    }
}
