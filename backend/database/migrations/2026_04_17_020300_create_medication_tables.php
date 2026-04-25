<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medications', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('generic_name')->nullable();
            $table->string('brand_name')->nullable();
            $table->string(' ATC_code')->nullable();
            $table->enum('form', ['tablet', 'capsule', 'liquid', 'injection', 'cream', 'ointment', 'drops', 'inhaler', 'patch', 'suppository', 'other'])->nullable();
            $table->string('strength')->nullable();
            $table->string('unit')->nullable();
            $table->text('storage_requirements')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('tenant_id');
        });

        Schema::create('medication_batches', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('medication_id')->constrained()->cascadeOnDelete();
            $table->foreignId('phc_center_id')->constrained()->cascadeOnDelete();
            $table->string('batch_number')->unique();
            $table->integer('quantity')->default(0);
            $table->integer('alert_threshold')->default(10);
            $table->date('manufacture_date')->nullable();
            $table->date('expiry_date')->nullable();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->enum('status', ['available', 'low_stock', 'expired', 'recalled'])->default('available');
            $table->timestamps();
            $table->softDeletes();

            $table->index('phc_center_id');
            $table->index('status');
            $table->index('expiry_date');
        });

        Schema::create('medication_logs', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('medication_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('patient_id')->nullable()->constrained('staff_profiles')->nullOnDelete();
            $table->foreignId('prescriber_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('dispenser_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('administrator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verifier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('step', ['prescribed', 'dispensed', 'administered', 'verified'])->notNull();
            $table->integer('quantity')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('medication_batch_id');
            $table->index('patient_id');
            $table->index('step');
        });

        Schema::create('medication_alerts', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('medication_batch_id')->constrained()->cascadeOnDelete();
            $table->foreignId('phc_center_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['low_stock', 'near_expiry', 'expired', 'recall', 'allergy_conflict', 'duplicate_therapy'])->notNull();
            $table->string('title');
            $table->text('message');
            $table->boolean('is_resolved')->default(false);
            $table->foreignId('resolved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('phc_center_id');
            $table->index('type');
            $table->index('is_resolved');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_alerts');
        Schema::dropIfExists('medication_logs');
        Schema::dropIfExists('medication_batches');
        Schema::dropIfExists('medications');
    }
};
