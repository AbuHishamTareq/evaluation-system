<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite does not support MODIFY or ENUM; the column was created as string in the original migration.
            // Just skip the ALTER and do the data updates if needed.
            return;
        }

        // MySQL requires dropping and recreating enum columns
        DB::statement("ALTER TABLE phc_centers MODIFY classification ENUM('primary', 'secondary', 'specialized', 'community') DEFAULT 'primary'");

        // Update existing data from old values to new values
        DB::statement("UPDATE phc_centers SET classification = 'primary' WHERE classification = 'level_1'");
        DB::statement("UPDATE phc_centers SET classification = 'secondary' WHERE classification = 'level_2_plus'");
        DB::statement("UPDATE phc_centers SET classification = 'community' WHERE classification = 'outreach_post'");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        // Convert back to old values
        DB::statement("UPDATE phc_centers SET classification = 'level_1' WHERE classification = 'primary'");
        DB::statement("UPDATE phc_centers SET classification = 'level_2_plus' WHERE classification = 'secondary'");
        DB::statement("UPDATE phc_centers SET classification = 'level_2_plus' WHERE classification = 'specialized'");
        DB::statement("UPDATE phc_centers SET classification = 'outreach_post' WHERE classification = 'community'");

        DB::statement("ALTER TABLE phc_centers MODIFY classification ENUM('outreach_post', 'level_1', 'level_2_plus') DEFAULT 'level_1'");
    }
};
