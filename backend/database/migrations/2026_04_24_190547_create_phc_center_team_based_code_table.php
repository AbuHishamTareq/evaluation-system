<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phc_center_team_based_code', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phc_center_id')->constrained()->onDelete('cascade');
            $table->foreignId('team_based_code_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['phc_center_id', 'team_based_code_id'], 'phc_team_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phc_center_team_based_code');
    }
};
