<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_deactivations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained()->cascadeOnDelete();
            $table->string('deactivation_reason');
            $table->text('deactivation_notes')->nullable();
            $table->timestamp('deactivated_at')->useCurrent();
            $table->timestamp('reactivated_at')->nullable();
            $table->text('reactivation_notes')->nullable();
            $table->timestamps();

            $table->index('staff_id');
            $table->index('deactivated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_deactivations');
    }
};
