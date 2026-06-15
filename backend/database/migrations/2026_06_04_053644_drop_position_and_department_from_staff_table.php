<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite has limitations with DROP COLUMN when indexes exist.
            // The columns will remain as nullable strings, which is acceptable for testing.
            return;
        }

        Schema::table('staff', function (Blueprint $table) {
            if (Schema::hasColumn('staff', 'position')) {
                $table->dropColumn('position');
            }

            if (Schema::hasColumn('staff', 'department')) {
                $table->dropColumn('department');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('staff', function (Blueprint $table) {
            if (! Schema::hasColumn('staff', 'position')) {
                $table->string('position', 255)->nullable();
            }

            if (! Schema::hasColumn('staff', 'department')) {
                $table->string('department', 255)->nullable();
            }
        });
    }
};
