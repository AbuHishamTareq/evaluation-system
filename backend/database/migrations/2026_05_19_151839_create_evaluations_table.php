<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('evaluation_templates')->onDelete('cascade');
            $table->foreignId('phc_center_id')->constrained('phc_centers')->onDelete('cascade');
            $table->foreignId('staff_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->foreignId('evaluator_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['draft', 'in_progress', 'completed', 'archived'])->default('draft');
            $table->decimal('total_score', 5, 2)->nullable();
            $table->decimal('max_score', 5, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->string('submitted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('template_id');
            $table->index('phc_center_id');
            $table->index('staff_id');
            $table->index('evaluator_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
