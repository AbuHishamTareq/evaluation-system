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
            if (! Schema::hasColumn('staff', 'scfhs_registration_no')) {
                $table->string('scfhs_registration_no', 255)->nullable()->index();
            }
            if (! Schema::hasColumn('staff', 'scfhs_issue_date')) {
                $table->date('scfhs_issue_date')->nullable();
            }
            if (! Schema::hasColumn('staff', 'scfhs_expiry_date')) {
                $table->date('scfhs_expiry_date')->nullable();
            }
            if (! Schema::hasColumn('staff', 'malpractice_insurance_no')) {
                $table->string('malpractice_insurance_no', 255)->nullable()->index();
            }
            if (! Schema::hasColumn('staff', 'malpractice_issue_date')) {
                $table->date('malpractice_issue_date')->nullable();
            }
            if (! Schema::hasColumn('staff', 'malpractice_expiry_date')) {
                $table->date('malpractice_expiry_date')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $columns = [
                'scfhs_registration_no',
                'scfhs_issue_date',
                'scfhs_expiry_date',
                'malpractice_insurance_no',
                'malpractice_issue_date',
                'malpractice_expiry_date',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('staff', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
