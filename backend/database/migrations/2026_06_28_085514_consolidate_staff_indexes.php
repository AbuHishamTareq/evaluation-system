<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $indexes = Schema::getIndexes('staff');
        $indexNames = array_column($indexes, 'name');

        if (in_array('staff_is_active_index', $indexNames)) {
            Schema::table('staff', function ($table) {
                $table->dropIndex(['is_active']);
            });
        }

        if (in_array('staff_employee_id_index', $indexNames)) {
            Schema::table('staff', function ($table) {
                $table->dropIndex(['employee_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::table('staff', function ($table) {
            $table->index(['is_active']);
        });

        Schema::table('staff', function ($table) {
            $table->index(['employee_id']);
        });
    }
};
