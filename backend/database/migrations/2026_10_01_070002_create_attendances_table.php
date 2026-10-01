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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete()->index();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete()->index();
            $table->date('attendance_date')->index();
            $table->timestamp('check_in_at')->nullable();
            $table->string('status')->default('hadir')->index(); // hadir, terlambat, izin, sakit, alpa
            $table->text('notes')->nullable();
            $table->timestamps();

            // Business rule: a student can have at most one attendance record per class per date
            $table->unique(['user_id', 'class_id', 'attendance_date'], 'user_class_date_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
