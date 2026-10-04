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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete()->index();
            $table->string('title');
            $table->date('date')->index();
            $table->string('start_time'); // HH:MM
            $table->string('end_time');   // HH:MM
            $table->string('location')->nullable();
            $table->string('status')->default('SCHEDULED')->index(); // SCHEDULED, ONGOING, COMPLETED, CANCELLED
            $table->text('notes')->nullable();
            $table->timestamps();

            // Compound index for fast lookup of class schedule by date
            $table->index(['class_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
