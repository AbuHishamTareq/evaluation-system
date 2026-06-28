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
        Schema::table('evaluations', function (Blueprint $table) {
            $table->index(['status', 'percentage']);
            $table->index(['phc_center_id', 'status', 'percentage']);
            $table->index(['completed_at']);
        });

        Schema::table('medication_evaluations', function (Blueprint $table) {
            $table->index(['status', 'percentage']);
            $table->index(['phc_center_id', 'status', 'percentage']);
            $table->index(['completed_at']);
        });

        Schema::table('action_plans', function (Blueprint $table) {
            $table->index(['status', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropIndex(['status', 'percentage']);
            $table->dropIndex(['phc_center_id', 'status', 'percentage']);
            $table->dropIndex(['completed_at']);
        });

        Schema::table('medication_evaluations', function (Blueprint $table) {
            $table->dropIndex(['status', 'percentage']);
            $table->dropIndex(['phc_center_id', 'status', 'percentage']);
            $table->dropIndex(['completed_at']);
        });

        Schema::table('action_plans', function (Blueprint $table) {
            $table->dropIndex(['status', 'due_date']);
        });
    }
};
