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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->string('level')->nullable();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->longText('full_description')->nullable();
            $table->string('duration')->nullable();
            $table->string('schedule')->nullable();
            $table->json('curriculum')->nullable();
            $table->text('target_audience')->nullable();
            $table->string('price_estimate')->nullable();
            $table->string('badge')->nullable();
            $table->string('image')->nullable();
            $table->string('status')->default('ACTIVE')->index(); // ACTIVE, DRAFT, ARCHIVED
            $table->integer('sort_order')->default(0);
            $table->integer('order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
