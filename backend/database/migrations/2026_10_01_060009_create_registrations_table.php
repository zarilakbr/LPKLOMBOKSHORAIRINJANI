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
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('registration_code')->unique()->index();
            $table->string('name');
            $table->string('full_name')->nullable();
            $table->string('email')->index();
            $table->string('phone')->index();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->date('dob')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete()->index();
            $table->foreignId('program_id')->nullable()->constrained('programs')->nullOnDelete()->index();
            $table->string('education')->nullable();
            $table->string('program_interest')->nullable();
            $table->string('japanese_level')->nullable();
            $table->string('japan_goal')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('pending')->index(); // pending, reviewed, accepted, rejected
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
