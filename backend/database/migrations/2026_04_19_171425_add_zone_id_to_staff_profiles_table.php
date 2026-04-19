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
        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->foreignId('zone_id')->nullable()->constrained('regions')->nullOnDelete();
            $table->index('zone_id');
        });
    }

    public function down(): void
    {
        Schema::table('staff_profiles', function (Blueprint $table) {
            $table->dropForeign(['zone_id']);
            $table->dropIndex(['zone_id']);
            $table->dropColumn('zone_id');
        });
    }
};
