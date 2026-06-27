<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_evaluation_template_medications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('medication_evaluation_templates')->cascadeOnDelete();
            $table->foreignId('medication_id')->constrained('medications')->cascadeOnDelete();
            $table->decimal('recommended_quantity', 10, 2);
            $table->string('allocation_location')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->unique(['template_id', 'medication_id'], 'metm_tmpl_med_unique');
            $table->index('template_id');
            $table->index('medication_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_evaluation_template_medications');
    }
};
