<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminPassword = env('ADMIN_DEFAULT_PASSWORD', 'ShoraiAdmin2026!');
        $teacherPassword = env('TEACHER_DEFAULT_PASSWORD', 'ShoraiSensei2026!');
        $studentPassword = env('STUDENT_DEFAULT_PASSWORD', 'ShoraiSiswa2026!');

        // 1. ADMIN Accounts
        User::updateOrCreate(
            ['email' => 'admin@example.test'],
            [
                'name' => 'Demo Admin (Pengelola)',
                'password' => Hash::make($adminPassword),
                'role' => User::ROLE_ADMIN,
                'department' => 'Academic & Institutional Management',
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@lombokshorairinjani.co.id'],
            [
                'name' => 'Administrator Lembaga',
                'password' => Hash::make($adminPassword),
                'role' => User::ROLE_ADMIN,
                'department' => 'Academic & Institutional Management',
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        // 2. PENGAJAR (Sensei) Accounts
        User::updateOrCreate(
            ['email' => 'teacher@example.test'],
            [
                'name' => 'Sensei Kenjiro Tanaka, M.Ed. (Demo)',
                'password' => Hash::make($teacherPassword),
                'role' => User::ROLE_PENGAJAR,
                'department' => 'Sensei Utama & Kurikulum N4/N3',
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'pengajar@lombokshorairinjani.co.id'],
            [
                'name' => 'Sensei Kenjiro Tanaka, M.Ed.',
                'password' => Hash::make($teacherPassword),
                'role' => User::ROLE_PENGAJAR,
                'department' => 'Sensei Utama & Kurikulum N4/N3',
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'rina.sensei@lombokshorairinjani.co.id'],
            [
                'name' => 'Sensei Rina Puspita, S.Hum.',
                'password' => Hash::make($teacherPassword),
                'role' => User::ROLE_PENGAJAR,
                'department' => 'Sensei Bahasa Jepang Dasar N5',
                'status' => User::STATUS_ACTIVE,
                'email_verified_at' => now(),
            ]
        );

        // 3. SISWA Accounts (Peserta Didik / Calon Siswa)
        $students = [
            [
                'name' => 'Demo Siswa (Student)',
                'email' => 'student@example.test',
                'phone' => '081234567800',
                'profile' => [
                    'full_name' => 'Demo Siswa Shorai',
                    'phone' => '081234567800',
                    'gender' => 'male',
                    'dob' => '2002-01-01',
                    'place_of_birth' => 'Mataram',
                    'address' => 'Jl. Pendidikan No. 1',
                    'city' => 'Mataram',
                    'province' => 'Nusa Tenggara Barat',
                    'education_level' => 'SMA/SMK',
                    'school_or_university' => 'SMK Negeri 3 Mataram',
                    'major' => 'Teknik',
                    'japanese_level' => 'Pemula Dasar N5',
                    'japan_goal' => 'Program Persiapan Kerja Jepang (Tokutei Ginou)',
                    'bio' => 'Akun demonstrasi siswa untuk pengujian fitur dashboard dan absensi.',
                ],
            ],
            [
                'name' => 'Ahmad Fajar Pratama',
                'email' => 'ahmad.fajar@example.test',
                'phone' => '081234567801',
                'profile' => [
                    'full_name' => 'Ahmad Fajar Pratama',
                    'phone' => '081234567801',
                    'gender' => 'male',
                    'dob' => '2002-05-14',
                    'place_of_birth' => 'Mataram',
                    'address' => 'Jl. Majapahit No. 12, Ampenan',
                    'city' => 'Mataram',
                    'province' => 'Nusa Tenggara Barat',
                    'education_level' => 'SMK',
                    'school_or_university' => 'SMK Negeri 3 Mataram',
                    'major' => 'Teknik Pemesinan',
                    'japanese_level' => 'Pemula Murni',
                    'japan_goal' => 'Bekerja di Sektor Manufaktur Mesin Presisi Jepang',
                    'bio' => 'Lulusan SMK yang bertekad membangun kemandirian finansial dan etos kerja industri di Jepang.',
                ],
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti.nurhaliza@example.test',
                'phone' => '082198765402',
                'profile' => [
                    'full_name' => 'Siti Nurhaliza',
                    'phone' => '082198765402',
                    'gender' => 'female',
                    'dob' => '2001-11-20',
                    'place_of_birth' => 'Praya',
                    'address' => 'Jl. Caturwarga No. 45',
                    'city' => 'Mataram',
                    'province' => 'Nusa Tenggara Barat',
                    'education_level' => 'D3',
                    'school_or_university' => 'Poltekkes Kemenkes Mataram',
                    'major' => 'Keperawatan',
                    'japanese_level' => 'Belajar Otodidak (Hiragana/Katakana)',
                    'japan_goal' => 'Karier Profesional Perawat Lansia (Kaigo Tokutei Ginou)',
                    'bio' => 'Lulusan D3 Keperawatan dengan empati tinggi dan dedikasi dalam pelayanan kesehatan geriatri.',
                ],
            ],
            [
                'name' => 'Bayu Wicaksono',
                'email' => 'bayu.wicaksono@example.test',
                'phone' => '087812345603',
                'profile' => [
                    'full_name' => 'Bayu Wicaksono',
                    'phone' => '087812345603',
                    'gender' => 'male',
                    'dob' => '2000-08-09',
                    'place_of_birth' => 'Tanjung',
                    'address' => 'Jl. Raya Tanjung KM 15',
                    'city' => 'Lombok Utara',
                    'province' => 'Nusa Tenggara Barat',
                    'education_level' => 'S1',
                    'school_or_university' => 'Universitas Mataram',
                    'major' => 'Pendidikan Bahasa',
                    'japanese_level' => 'JLPT N5 Resmi (Lulus 2024)',
                    'japan_goal' => 'Mengejar Sertifikasi N4 dan Penempatan Kerja Resmi',
                    'bio' => 'Pembelajar aktif yang telah mengantongi N5 dan bersiap menempuh ujian keahlian industri SSW.',
                ],
            ],
            [
                'name' => 'Reza Kurniawan',
                'email' => 'reza.kurniawan@example.test',
                'phone' => '085912349904',
                'profile' => [
                    'full_name' => 'Reza Kurniawan',
                    'phone' => '085912349904',
                    'gender' => 'male',
                    'dob' => '1998-03-22',
                    'place_of_birth' => 'Selong',
                    'address' => 'Jl. Selaparang No. 8',
                    'city' => 'Lombok Timur',
                    'province' => 'Nusa Tenggara Barat',
                    'education_level' => 'SMA',
                    'school_or_university' => 'SMA Negeri 1 Selong',
                    'major' => 'IPA',
                    'japanese_level' => 'Pemula',
                    'japan_goal' => 'Program Pelatihan Kerja Luar Negeri',
                    'bio' => 'Berminat menggali wawasan kerja dan disiplin teknologi di Jepang.',
                ],
            ],
        ];

        foreach ($students as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'phone' => $data['phone'],
                    'password' => Hash::make($studentPassword),
                    'role' => User::ROLE_SISWA,
                    'status' => User::STATUS_ACTIVE,
                    'email_verified_at' => now(),
                ]
            );

            // Create or update associated user personal profile
            UserProfile::updateOrCreate(
                ['user_id' => $user->id],
                array_merge(['user_id' => $user->id], $data['profile'])
            );
        }
    }
}
