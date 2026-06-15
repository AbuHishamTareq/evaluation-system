<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_educational_degree', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
            $table->foreignId('educational_degree_id')->constrained('educational_degrees')->cascadeOnDelete();
            $table->string('institution', 255)->nullable();
            $table->year('year_obtained')->nullable();
            $table->timestamps();

            $table->unique(['staff_id', 'educational_degree_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_educational_degree');
    }
};
