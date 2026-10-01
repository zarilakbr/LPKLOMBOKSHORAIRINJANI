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
        // 1. Programs: add featured column
        if (Schema::hasTable('programs')) {
            Schema::table('programs', function (Blueprint $table) {
                if (!Schema::hasColumn('programs', 'featured')) {
                    $table->boolean('featured')->default(false)->after('status')->index();
                }
            });
        }

        // 2. Classes: add teacher_id foreign key
        if (Schema::hasTable('classes')) {
            Schema::table('classes', function (Blueprint $table) {
                if (!Schema::hasColumn('classes', 'teacher_id')) {
                    $table->foreignId('teacher_id')->nullable()->after('program_id')->constrained('users')->nullOnDelete()->index();
                }
            });
        }

        // 3. Opportunities: add type & published_at
        if (Schema::hasTable('opportunities')) {
            Schema::table('opportunities', function (Blueprint $table) {
                if (!Schema::hasColumn('opportunities', 'type')) {
                    $table->string('type')->nullable()->after('location');
                }
                if (!Schema::hasColumn('opportunities', 'published_at')) {
                    $table->timestamp('published_at')->nullable()->after('status');
                }
            });
        }

        // 4. Articles: add featured_image & author_id
        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (!Schema::hasColumn('articles', 'featured_image')) {
                    $table->string('featured_image')->nullable()->after('content');
                }
                if (!Schema::hasColumn('articles', 'author_id')) {
                    $table->foreignId('author_id')->nullable()->after('status')->constrained('users')->nullOnDelete()->index();
                }
            });
        }

        // 5. Registrations: add registration_date & notes
        if (Schema::hasTable('registrations')) {
            Schema::table('registrations', function (Blueprint $table) {
                if (!Schema::hasColumn('registrations', 'registration_date')) {
                    $table->timestamp('registration_date')->nullable()->after('status')->index();
                }
                if (!Schema::hasColumn('registrations', 'notes')) {
                    $table->text('notes')->nullable()->after('registration_date');
                }
            });
            DB::table('registrations')->whereNull('registration_date')->update(['registration_date' => now()]);
        }

        // 6. Normalize legacy 'USER' role to 'SISWA'
        if (Schema::hasTable('users')) {
            DB::table('users')->where('role', 'USER')->update(['role' => 'SISWA']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('programs')) {
            Schema::table('programs', function (Blueprint $table) {
                if (Schema::hasColumn('programs', 'featured')) {
                    $table->dropColumn('featured');
                }
            });
        }

        if (Schema::hasTable('classes')) {
            Schema::table('classes', function (Blueprint $table) {
                if (Schema::hasColumn('classes', 'teacher_id')) {
                    $table->dropConstrainedForeignId('teacher_id');
                }
            });
        }

        if (Schema::hasTable('opportunities')) {
            Schema::table('opportunities', function (Blueprint $table) {
                if (Schema::hasColumn('opportunities', 'type')) {
                    $table->dropColumn('type');
                }
                if (Schema::hasColumn('opportunities', 'published_at')) {
                    $table->dropColumn('published_at');
                }
            });
        }

        if (Schema::hasTable('articles')) {
            Schema::table('articles', function (Blueprint $table) {
                if (Schema::hasColumn('articles', 'featured_image')) {
                    $table->dropColumn('featured_image');
                }
                if (Schema::hasColumn('articles', 'author_id')) {
                    $table->dropConstrainedForeignId('author_id');
                }
            });
        }

        if (Schema::hasTable('registrations')) {
            Schema::table('registrations', function (Blueprint $table) {
                if (Schema::hasColumn('registrations', 'registration_date')) {
                    $table->dropColumn('registration_date');
                }
                if (Schema::hasColumn('registrations', 'notes')) {
                    $table->dropColumn('notes');
                }
            });
        }
    }
};
