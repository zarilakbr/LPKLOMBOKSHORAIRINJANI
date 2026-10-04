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
            $table->unsignedBigInteger('user_id')->nullable();
	    $table->unsignedBigInteger('program_id')->nullable();

            $table->index('user_id');
            $table->index('program_id');

            $table->foreign('user_id', 'registrations_user_id_foreign')
            ->references('id')
            ->on('users')
            ->cascadeOnDelete();

            $table->foreign('program_id', 'registrations_program_id_foreign')
            ->references('id')
            ->on('programs')
            ->nullOnDelete();
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
