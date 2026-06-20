<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phc_medication', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phc_center_id')->constrained('phc_centers')->onDelete('cascade');
            $table->foreignId('medication_id')->constrained('medications')->onDelete('cascade');
            $table->decimal('recommended_quantity', 10, 2);
            $table->decimal('current_stock', 10, 2)->nullable();
            $table->string('allocation_location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['phc_center_id', 'medication_id']);
            $table->index('phc_center_id');
            $table->index('medication_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phc_medication');
    }
};
