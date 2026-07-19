<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('panel_participant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('panel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('participant_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('panel_participant');
    }
};
