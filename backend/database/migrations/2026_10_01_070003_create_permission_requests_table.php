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
        Schema::create('permission_requests', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('class_id');
            $table->unsignedBigInteger('reviewed_by')->nullable();

            $table->index('user_id');
            $table->index('class_id');
            $table->index('reviewed_by');

            $table->foreign('user_id', 'permission_requests_user_id_foreign')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('class_id', 'permission_requests_class_id_foreign')
                ->references('id')
                ->on('classes')
                ->cascadeOnDelete();

            $table->foreign('reviewed_by', 'permission_requests_reviewed_by_foreign')
                ->references('id')
                ->on('users')
                ->nullOnDelete();

            $table->string('type')->index();
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason');
            $table->string('status')->default('pending')->index();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('permission_requests');
    }
};