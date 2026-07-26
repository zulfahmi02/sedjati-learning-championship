<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('score_sheets', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['participant_id']);
            $table->dropForeign(['round_id']);

            $table->foreign('user_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('participant_id')->references('id')->on('participants')->restrictOnDelete();
            $table->foreign('round_id')->references('id')->on('rounds')->restrictOnDelete();
        });

        Schema::table('scores', function (Blueprint $table) {
            $table->dropForeign(['score_sheet_id']);
            $table->dropForeign(['criterion_id']);

            $table->foreign('score_sheet_id')->references('id')->on('score_sheets')->restrictOnDelete();
            $table->foreign('criterion_id')->references('id')->on('criteria')->restrictOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('scores', function (Blueprint $table) {
            $table->dropForeign(['score_sheet_id']);
            $table->dropForeign(['criterion_id']);

            $table->foreign('score_sheet_id')->references('id')->on('score_sheets')->cascadeOnDelete();
            $table->foreign('criterion_id')->references('id')->on('criteria')->cascadeOnDelete();
        });

        Schema::table('score_sheets', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['participant_id']);
            $table->dropForeign(['round_id']);

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('participant_id')->references('id')->on('participants')->cascadeOnDelete();
            $table->foreign('round_id')->references('id')->on('rounds')->cascadeOnDelete();
        });
    }
};
