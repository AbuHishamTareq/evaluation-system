<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_based_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('description')->nullable();
            $table->foreignId('phc_center_id')->nullable()->constrained('phc_centers')->onDelete('set null');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->boolean('is_active')->default(true);
            $table->date('assigned_at')->nullable();
            $table->date('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('phc_center_id');
            $table->index('staff_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_based_codes');
    }
};
