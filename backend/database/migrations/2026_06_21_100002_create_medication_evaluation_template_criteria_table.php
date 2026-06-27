<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_evaluation_template_criteria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('medication_evaluation_templates')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('type');
            $table->decimal('weight', 8, 2)->default(1.00);
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index('template_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_evaluation_template_criteria');
    }
};
