<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phc_centers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->foreignId('zone_id')->nullable()->constrained('zones')->onDelete('set null');
            $table->enum('classification', ['primary', 'secondary', 'specialized', 'community'])->default('primary');
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('region')->nullable();
            $table->string('zone')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('zone_id');
            $table->index('classification');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phc_centers');
    }
};
