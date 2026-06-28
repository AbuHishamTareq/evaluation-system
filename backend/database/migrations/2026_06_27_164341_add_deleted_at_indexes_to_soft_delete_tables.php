<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $evaluationsIndexes = Schema::getIndexes('evaluations');
        $evaluationsIndexNames = array_column($evaluationsIndexes, 'name');
        if (! in_array('evaluations_deleted_at_status_index', $evaluationsIndexNames)) {
            Schema::table('evaluations', function (Blueprint $table) {
                $table->index(['deleted_at', 'status']);
            });
        }

        Schema::table('staff', function (Blueprint $table) {
            $table->index(['deleted_at', 'is_active']);
        });

        Schema::table('action_plans', function (Blueprint $table) {
            $table->index(['deleted_at', 'status', 'due_date']);
        });
    }

    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropIndex(['deleted_at', 'status']);
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropIndex(['deleted_at', 'is_active']);
        });

        Schema::table('action_plans', function (Blueprint $table) {
            $table->dropIndex(['deleted_at', 'status', 'due_date']);
        });
    }
};
