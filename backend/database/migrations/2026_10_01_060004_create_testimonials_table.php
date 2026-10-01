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
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable();
            $table->text('content')->nullable();
            $table->text('quote')->nullable();
            $table->string('photo')->nullable();
            $table->string('avatar')->nullable();
            $table->string('program')->nullable();
            $table->string('placement')->nullable();
            $table->string('year')->nullable();
            $table->string('badge')->nullable();
            $table->string('status')->default('PUBLISHED')->index(); // PUBLISHED, DRAFT, HIDDEN
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
