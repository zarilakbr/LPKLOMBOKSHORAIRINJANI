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
        Schema::create('materials', function (Blueprint $table) {
    $table->id();

    $table->unsignedBigInteger('class_id');
    $table->unsignedBigInteger('teacher_id');

    $table->index('class_id');
    $table->index('teacher_id');

    $table->foreign('class_id', 'materials_class_id_foreign')
        ->references('id')
        ->on('classes')
        ->cascadeOnDelete();

    $table->foreign('teacher_id', 'materials_teacher_id_foreign')
        ->references('id')
        ->on('users')
        ->cascadeOnDelete();

    $table->string('title');
    $table->text('description')->nullable();
    $table->string('type')->default('file')->index();
    $table->string('file_path')->nullable();
    $table->string('original_filename')->nullable();
    $table->string('mime_type')->nullable();
    $table->unsignedBigInteger('file_size')->nullable();
    $table->text('external_url')->nullable();
    $table->boolean('is_published')->default(false)->index();
    $table->timestamp('published_at')->nullable()->index();
    $table->timestamps();

    // Compound index for student query
    $table->index(['class_id', 'is_published', 'created_at']);
    $table->index(['teacher_id', 'class_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
