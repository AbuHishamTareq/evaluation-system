<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_id')->constrained('evaluations')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->text('answer_text')->nullable();
            $table->string('answer_yes_no')->nullable();
            $table->integer('answer_rating')->nullable();
            $table->string('answer_multiple_choice')->nullable();
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->nullable();
            $table->string('evidence_path')->nullable();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('evaluation_id');
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_answers');
    }
};
