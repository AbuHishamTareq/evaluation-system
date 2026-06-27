<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('medication_evaluation_templates');
            $table->foreignId('phc_center_id')->constrained('phc_centers');
            $table->foreignId('evaluator_id')->constrained('users');
            $table->string('status')->default('draft');
            $table->decimal('total_score', 10, 2)->nullable();
            $table->decimal('max_score', 10, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('template_id');
            $table->index('phc_center_id');
            $table->index('evaluator_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_evaluations');
    }
};
