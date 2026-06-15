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
            if (! Schema::hasColumn('staff', 'department_id')) {
                $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            }

            if (! Schema::hasColumn('staff', 'clinic_assignment_id')) {
                $table->foreignId('clinic_assignment_id')->nullable()->constrained('clinic_assignments')->nullOnDelete();
            }

            if (! Schema::hasColumn('staff', 'professional_id')) {
                $table->foreignId('professional_id')->nullable()->constrained('professionals')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            if (Schema::hasColumn('staff', 'professional_id')) {
                $table->dropForeign(['professional_id']);
                $table->dropColumn('professional_id');
            }

            if (Schema::hasColumn('staff', 'clinic_assignment_id')) {
                $table->dropForeign(['clinic_assignment_id']);
                $table->dropColumn('clinic_assignment_id');
            }

            if (Schema::hasColumn('staff', 'department_id')) {
                $table->dropForeign(['department_id']);
                $table->dropColumn('department_id');
            }
        });
    }
};
