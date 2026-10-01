<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programN5 = Program::where('slug', 'demo-bahasa-jepang-dasar-n5')->first() ?: Program::first();
        $programN4 = Program::where('slug', 'demo-bahasa-jepang-pra-menengah-n4')->first() ?: Program::skip(1)->first() ?: $programN5;
        $programKaigo = Program::where('slug', 'demo-tokutei-ginou-kaigo-caregiver')->first() ?: Program::skip(2)->first() ?: $programN5;

        $teacherSensei = User::where('email', 'teacher@example.test')->first()
            ?: User::where('role', User::ROLE_PENGAJAR)->first();
        $teacherId = $teacherSensei ? $teacherSensei->id : null;

        $classes = [
            [
                'program_id' => $programN5 ? $programN5->id : 1,
                'teacher_id' => $teacherId,
                'name' => 'Demo Kelas N5 Pagi - Angkatan 14',
                'class_name' => 'Demo Kelas N5 Pagi - Angkatan 14',
                'instructor' => 'Kenji Tanaka Sensei & Rina Sensei',
                'level' => 'Pemula (N5)',
                'schedule' => 'Senin - Kamis (08:30 - 11:30 WITA)',
                'start_date' => now()->addDays(14)->format('Y-m-d'),
                'end_date' => now()->addMonths(3)->format('Y-m-d'),
                'capacity' => 20,
                'current_students' => 14,
                'location' => 'Ruang Teori Fuji (Lantai 2)',
                'status' => 'OPEN',
                'description' => 'Kelas demo intensif pagi untuk penguasaan Hiragana, Katakana, dan tata bahasa dasar N5.',
            ],
            [
                'program_id' => $programN5 ? $programN5->id : 1,
                'teacher_id' => $teacherId,
                'name' => 'Demo Kelas N5 Sore - Angkatan 15',
                'class_name' => 'Demo Kelas N5 Sore - Angkatan 15',
                'instructor' => 'Bambang Sensei (JLPT N2)',
                'level' => 'Pemula (N5)',
                'schedule' => 'Senin - Kamis (15:00 - 18:00 WITA)',
                'start_date' => now()->addDays(28)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'capacity' => 18,
                'current_students' => 6,
                'location' => 'Ruang Teori Sakura (Lantai 2)',
                'status' => 'OPEN',
                'description' => 'Kelas demo sesi sore bagi lulusan sekolah atau profesional muda.',
            ],
            [
                'program_id' => $programN4 ? $programN4->id : 2,
                'teacher_id' => $teacherId,
                'name' => 'Demo Kelas Intensif JFT N4 - Angkatan 09',
                'class_name' => 'Demo Kelas Intensif JFT N4 - Angkatan 09',
                'instructor' => 'Yoko Sato Sensei & Ardi Sensei',
                'level' => 'Pra-Menengah (N4)',
                'schedule' => 'Senin - Jumat (08:30 - 13:00 WITA)',
                'start_date' => now()->addDays(7)->format('Y-m-d'),
                'end_date' => now()->addMonths(3)->format('Y-m-d'),
                'capacity' => 16,
                'current_students' => 16,
                'location' => 'Laboratorium CBT & Bahasa (Lantai 3)',
                'status' => 'FULL',
                'description' => 'Kelas demo persiapan akselerasi ujian JFT-Basic A2 dan kanji level N4.',
            ],
            [
                'program_id' => $programKaigo ? $programKaigo->id : 3,
                'teacher_id' => $teacherId,
                'name' => 'Demo Praktik Keperawatan Kaigo - Batch 06',
                'class_name' => 'Demo Praktik Keperawatan Kaigo - Batch 06',
                'instructor' => 'Ns. Dewi Sartika, S.Kep & Hiroshi Sensei',
                'level' => 'Keahlian Kaigo',
                'schedule' => 'Senin - Jumat (09:00 - 14:30 WITA)',
                'start_date' => now()->addDays(21)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'capacity' => 15,
                'current_students' => 9,
                'location' => 'Mockup Nursing Care Dojo (Lantai 1)',
                'status' => 'OPEN',
                'description' => 'Kelas demo keahlian teknis perawatan lansia dengan peralatan medis standar panti Jepang.',
            ],
        ];

        foreach ($classes as $item) {
            ProgramClass::updateOrCreate(
                [
                    'program_id' => $item['program_id'],
                    'name' => $item['name']
                ],
                $item
            );
        }
    }
}
