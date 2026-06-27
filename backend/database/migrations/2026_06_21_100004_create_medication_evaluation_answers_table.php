<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_evaluation_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('medication_evaluations')->cascadeOnDelete();
            $table->foreignId('template_medication_id')->constrained('medication_evaluation_template_medications');
            $table->foreignId('criterion_id')->constrained('medication_evaluation_template_criteria');
            $table->text('answer_value')->nullable();
            $table->decimal('score', 10, 2)->nullable();
            $table->decimal('max_score', 10, 2)->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['evaluation_id', 'template_medication_id', 'criterion_id'], 'med_eval_answers_unique');
            $table->index('evaluation_id');
            $table->index('template_medication_id');
            $table->index('criterion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_evaluation_answers');
    }
};
