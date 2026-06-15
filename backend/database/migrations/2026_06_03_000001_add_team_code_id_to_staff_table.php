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
        Schema::table('staff', function (Blueprint $table) {
            if (! Schema::hasColumn('staff', 'team_code_id')) {
                $table->foreignId('team_code_id')->nullable()->constrained('team_codes')->nullOnDelete();
                $table->index('team_code_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            if (Schema::hasColumn('staff', 'team_code_id')) {
                $table->dropForeign(['team_code_id']);
                $table->dropColumn('team_code_id');
            }
        });
    }
};
