<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('question_categories')->onDelete('cascade');
            $table->string('question_text');
            $table->text('description')->nullable();
            $table->enum('question_type', ['yes_no', 'rating_1_5', 'multiple_choice', 'text'])->default('yes_no');
            $table->json('options')->nullable();
            $table->integer('weight')->default(1);
            $table->integer('max_score')->default(100);
            $table->boolean('is_required')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index('category_id');
            $table->index('question_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
