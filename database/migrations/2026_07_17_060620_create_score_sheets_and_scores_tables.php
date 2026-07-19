<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('score_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('round_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'participant_id', 'round_id']);
            $table->index(['round_id', 'status']);
        });

        Schema::create('scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('score_sheet_id')->constrained()->cascadeOnDelete();
            $table->foreignId('criterion_id')->constrained('criteria')->cascadeOnDelete();
            $table->decimal('value', 5, 2);
            $table->timestamps();

            $table->unique(['score_sheet_id', 'criterion_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scores');
        Schema::dropIfExists('score_sheets');
    }
};
