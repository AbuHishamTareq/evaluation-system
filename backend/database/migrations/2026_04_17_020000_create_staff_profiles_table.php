<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff_profiles', static function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('phc_center_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();
            $table->string('employee_id')->unique()->nullable();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('first_name_ar')->nullable();
            $table->string('last_name_ar')->nullable();
            $table->string('phone')->nullable();
            $table->string('national_id')->nullable();
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female'])->nullable();
            $table->string('scfhs_license')->nullable();
            $table->date('scfhs_license_expiry')->nullable();
            $table->string('malpractice_insurance')->nullable();
            $table->date('malpractice_expiry')->nullable();
            $table->text('certifications')->nullable();
            $table->text('education')->nullable();
            $table->enum('employment_status', ['active', 'on_leave', 'suspended', 'terminated'])->default('active');
            $table->date('hire_date')->nullable();
            $table->date('termination_date')->nullable();
            $table->timestamps();

            $table->index('phc_center_id');
            $table->index('department_id');
            $table->index('employment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('staff_profiles');
    }
};
