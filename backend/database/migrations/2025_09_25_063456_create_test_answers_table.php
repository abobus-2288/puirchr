<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('test_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('test_result_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('question_index');
            $table->unsignedInteger('answer_value');
            $table->timestamps();

            $table->index(['test_result_id', 'question_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('test_answers');
    }
};
