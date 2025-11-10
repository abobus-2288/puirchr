<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->json('scoring_logic')->nullable()->after('questions');
            $table->json('result_interpretation')->nullable()->after('scoring_logic');
        });
    }

    public function down(): void
    {
        Schema::table('tests', function (Blueprint $table) {
            $table->dropColumn(['scoring_logic', 'result_interpretation']);
        });
    }
};
