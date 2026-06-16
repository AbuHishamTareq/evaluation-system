<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_sub_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_category_id')->constrained('question_categories')->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 50);
            $table->text('description')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->unique(['question_category_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_sub_categories');
    }
};
