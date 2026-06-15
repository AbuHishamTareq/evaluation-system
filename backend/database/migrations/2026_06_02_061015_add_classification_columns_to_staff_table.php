<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            if (! Schema::hasColumn('staff', 'field_id')) {
                $table->foreignId('field_id')->nullable()->constrained('fields')->nullOnDelete();
            }
            if (! Schema::hasColumn('staff', 'specialty_id')) {
                $table->foreignId('specialty_id')->nullable()->constrained('specialties')->nullOnDelete();
            }
            if (! Schema::hasColumn('staff', 'rank_id')) {
                $table->foreignId('rank_id')->nullable()->constrained('ranks')->nullOnDelete();
            }
            if (! Schema::hasColumn('staff', 'classification_category_id')) {
                $table->foreignId('classification_category_id')->nullable()->constrained('categories')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $columns = ['field_id', 'specialty_id', 'rank_id', 'classification_category_id'];

            foreach ($columns as $column) {
                if (Schema::hasColumn('staff', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
