<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_template_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('evaluation_templates')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->integer('weight')->default(1);
            $table->timestamps();

            $table->unique(['template_id', 'question_id']);
            $table->index('template_id');
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_template_questions');
    }
};
