<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->decimal('total_score', 10, 2)->nullable()->change();
            $table->decimal('max_score', 10, 2)->nullable()->change();
        });

        Schema::table('evaluation_answers', function (Blueprint $table) {
            $table->decimal('score', 10, 2)->nullable()->change();
            $table->decimal('max_score', 10, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->decimal('total_score', 5, 2)->nullable()->change();
            $table->decimal('max_score', 5, 2)->nullable()->change();
        });

        Schema::table('evaluation_answers', function (Blueprint $table) {
            $table->decimal('score', 5, 2)->nullable()->change();
            $table->decimal('max_score', 5, 2)->nullable()->change();
        });
    }
};
