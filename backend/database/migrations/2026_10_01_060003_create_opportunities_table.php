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
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('company_name')->nullable();
            $table->string('sector')->nullable();
            $table->string('location')->nullable();
            $table->string('employment_type')->nullable(); // Tokutei Ginou (SSW), Magang (Ginou Jisshuusei), Engineer
            $table->string('salary_range')->nullable();
            $table->string('language_req')->nullable();
            $table->string('age_req')->nullable();
            $table->longText('description')->nullable();
            $table->json('requirements')->nullable();
            $table->json('benefits')->nullable();
            $table->date('deadline')->nullable();
            $table->string('image')->nullable();
            $table->string('status')->default('OPEN')->index(); // OPEN, CLOSED, DRAFT
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
