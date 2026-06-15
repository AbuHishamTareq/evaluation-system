<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff_educational_degree', function (Blueprint $table) {
            if (! Schema::hasColumn('staff_educational_degree', 'degree_field')) {
                $table->string('degree_field', 255)->nullable();
            }
            if (! Schema::hasColumn('staff_educational_degree', 'gpa_type')) {
                $table->enum('gpa_type', ['point', 'percentage'])->nullable();
            }
            if (! Schema::hasColumn('staff_educational_degree', 'gpa_value')) {
                $table->decimal('gpa_value', 5, 2)->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('staff_educational_degree', function (Blueprint $table) {
            $columns = ['degree_field', 'gpa_type', 'gpa_value'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('staff_educational_degree', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
