<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('code', 50)->unique();
            $table->foreignId('parent_id')->nullable()->constrained('zones')->onDelete('set null');
            $table->enum('level', ['region', 'district', 'sub_district']);
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['parent_id']);
            $table->index(['level']);
            $table->index(['code']);
            $table->index(['name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zones');
    }
};
