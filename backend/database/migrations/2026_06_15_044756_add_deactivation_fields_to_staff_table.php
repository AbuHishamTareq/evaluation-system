<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('deactivation_reason')->nullable()->after('is_active');
            $table->text('deactivation_notes')->nullable()->after('deactivation_reason');
        });
    }

    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['deactivation_reason', 'deactivation_notes']);
        });
    }
};
