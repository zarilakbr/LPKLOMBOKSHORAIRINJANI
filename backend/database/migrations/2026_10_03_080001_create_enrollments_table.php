<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('class_id');

            $table->index('user_id');
            $table->index('class_id');

            $table->foreign('user_id', 'enrollments_user_id_foreign')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            $table->foreign('class_id', 'enrollments_class_id_foreign')
                ->references('id')
                ->on('classes')
                ->cascadeOnDelete();

            $table->string('status')->default('ACTIVE')->index();
            $table->timestamp('enrolled_at')->useCurrent()->index();
            $table->timestamp('ended_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // Compound indexes for rapid lookup of active student/class rosters
            $table->index(['user_id', 'status']);
            $table->index(['class_id', 'status']);
        });

        // Partial unique index to prevent duplicate ACTIVE enrollment per student & class
        // Supported in SQLite and PostgreSQL while allowing historical (COMPLETED/CANCELLED) records
        DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS unique_active_enrollment ON enrollments (user_id, class_id) WHERE status = 'ACTIVE'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};