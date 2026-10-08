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
        if (!Schema::hasTable('student_resumes')) {
            Schema::create('student_resumes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->string('register_no')->nullable();
                $table->text('profile_photo')->nullable();
                $table->json('data_id')->nullable();
                $table->json('data_jp')->nullable();
                $table->string('status', 30)->default('DRAFT');
                $table->timestamps();

                $table->index('user_id');
                $table->index('status');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_resumes');
    }
};
