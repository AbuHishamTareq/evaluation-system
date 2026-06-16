<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite doesn't support ENUM; column was already created as string.
            return;
        }

        // Convert existing old ENUM values to new values before changing column type
        DB::statement("UPDATE questions SET question_type = 'radio' WHERE question_type = 'yes_no'");
        DB::statement("UPDATE questions SET question_type = 'rating' WHERE question_type = 'rating_1_5'");
        DB::statement("UPDATE questions SET question_type = 'select' WHERE question_type = 'multiple_choice'");

        // Change column from ENUM to VARCHAR to accept the full set of valid values
        DB::statement("ALTER TABLE questions MODIFY question_type VARCHAR(50) NOT NULL DEFAULT 'text'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Convert new values back to old ENUM-compatible values
        DB::statement("UPDATE questions SET question_type = 'yes_no' WHERE question_type = 'radio'");
        DB::statement("UPDATE questions SET question_type = 'rating_1_5' WHERE question_type = 'rating'");
        DB::statement("UPDATE questions SET question_type = 'multiple_choice' WHERE question_type = 'select'");
        DB::statement("UPDATE questions SET question_type = 'text' WHERE question_type = 'textarea'");

        // Restore the ENUM column
        DB::statement("ALTER TABLE questions MODIFY question_type ENUM('yes_no', 'rating_1_5', 'multiple_choice', 'text') NOT NULL DEFAULT 'yes_no'");
    }
};
