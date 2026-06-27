<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('phc_medication', function (Blueprint $table) {
            $table->dropUnique(['phc_center_id', 'medication_id']);
            $table->unique(['phc_center_id', 'medication_id', 'allocation_location'], 'phc_med_center_med_location_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('phc_medication', function (Blueprint $table) {
            $table->dropUnique('phc_med_center_med_location_unique');
            $table->unique(['phc_center_id', 'medication_id']);
        });
    }
};
