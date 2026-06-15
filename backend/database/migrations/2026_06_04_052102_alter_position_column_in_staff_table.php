<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite does not support MODIFY COLUMN; the column was already created as string.
            return;
        }

        // Change position column from ENUM to VARCHAR to accept any string value (e.g., professional role names)
        DB::statement('ALTER TABLE staff MODIFY COLUMN position VARCHAR(255) NULL');
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Restore the ENUM type
        DB::statement("ALTER TABLE staff MODIFY COLUMN position ENUM('doctor', 'nurse', 'technician', 'admin', 'support', 'other') NULL");
    }
};
