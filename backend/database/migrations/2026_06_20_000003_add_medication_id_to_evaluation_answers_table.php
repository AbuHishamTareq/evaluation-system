<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_answers', function (Blueprint $table) {
            $table->foreignId('medication_id')->nullable()->constrained('medications')->onDelete('set null');
            $table->index('medication_id');
        });
    }

    public function down(): void
    {
        Schema::table('evaluation_answers', function (Blueprint $table) {
            $table->dropForeign(['medication_id']);
            $table->dropColumn('medication_id');
        });
    }
};
