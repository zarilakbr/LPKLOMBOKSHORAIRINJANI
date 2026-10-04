<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $class = ProgramClass::first();
        if (!$class) {
            return;
        }

        $students = User::where('role', User::ROLE_SISWA)->get();

        foreach ($students as $student) {
            Enrollment::firstOrCreate(
                [
                    'user_id'  => $student->id,
                    'class_id' => $class->id,
                ],
                [
                    'status'      => 'ACTIVE',
                    'enrolled_at' => now(),
                    'notes'       => 'Seeded enrollment for development testing.',
                ]
            );
        }
    }
}
