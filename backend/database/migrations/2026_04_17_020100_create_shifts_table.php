<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shifts', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('department_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('date');
            $table->index('status');
            $table->unique(['staff_profile_id', 'date', 'start_time']);
        });

        Schema::create('shift_requests', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('staff_profiles')->cascadeOnDelete();
            $table->foreignId('approver_id')->nullable()->constrained('staff_profiles')->nullOnDelete();
            $table->foreignId('original_shift_id')->constrained('shifts')->cascadeOnDelete();
            $table->foreignId('target_shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->enum('type', ['swap', 'cover'])->default('swap');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('reason')->nullable();
            $table->text('approver_notes')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('requester_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shift_requests');
        Schema::dropIfExists('shifts');
    }
};
