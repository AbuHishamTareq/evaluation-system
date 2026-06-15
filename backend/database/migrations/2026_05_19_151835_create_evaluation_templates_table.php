<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('schedule_type', ['one_time', 'monthly', 'quarterly', 'custom'])->default('one_time');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('total_score')->default(100);
            $table->boolean('is_active')->default(true);
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('schedule_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_templates');
    }
};
