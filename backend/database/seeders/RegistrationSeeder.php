<?php

namespace Database\Seeders;

use App\Models\Program;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $progN5 = Program::where('slug', 'demo-bahasa-jepang-dasar-n5')->first();
        $progN4 = Program::where('slug', 'demo-bahasa-jepang-pra-menengah-n4')->first();
        $progKaigo = Program::where('slug', 'demo-tokutei-ginou-kaigo-caregiver')->first();

        $userDemo = User::where('email', 'student@example.test')->first();
        $userFajar = User::where('email', 'ahmad.fajar@example.test')->first();
        $userSiti = User::where('email', 'siti.nurhaliza@example.test')->first();
        $userBayu = User::where('email', 'bayu.wicaksono@example.test')->first();
        $userReza = User::where('email', 'reza.kurniawan@example.test')->first();

        $registrations = [
            [
                'registration_code' => 'REG-2026-DEMO01',
                'user_id' => $userDemo ? $userDemo->id : null,
                'program_id' => $progN5 ? $progN5->id : 1,
                'name' => 'Demo Siswa (Student)',
                'full_name' => 'Demo Siswa Shorai',
                'email' => 'student@example.test',
                'phone' => '081234567800',
                'address' => 'Jl. Pendidikan No. 1, Mataram',
                'city' => 'Mataram',
                'dob' => '2002-01-01',
                'education' => 'SMA/SMK',
                'program_interest' => 'Kelas N5 Dasar Reguler',
                'japanese_level' => 'Pemula Murni',
                'japan_goal' => 'Program Persiapan Kerja Jepang (Tokutei Ginou)',
                'message' => 'Akun demonstrasi siswa resmi terdaftar untuk verifikasi sistem database.',
                'status' => 'accepted',
                'registration_date' => now()->subDays(5),
                'notes' => 'Pendaftaran demonstrasi siswa telah disetujui.',
                'admin_notes' => 'Pendaftaran demonstrasi siswa telah disetujui.',
            ],
            [
                'registration_code' => 'REG-2026-00101',
                'user_id' => $userFajar ? $userFajar->id : null,
                'program_id' => $progN5 ? $progN5->id : 1,
                'name' => 'Ahmad Fajar Pratama',
                'full_name' => 'Ahmad Fajar Pratama',
                'email' => 'ahmad.fajar@example.test',
                'phone' => '081234567801',
                'address' => 'Jl. Majapahit No. 12, Ampenan',
                'city' => 'Mataram',
                'dob' => '2002-05-14',
                'education' => 'SMK Teknik Mesin',
                'program_interest' => 'Kelas N5 Dasar Reguler',
                'japanese_level' => 'Pemula Murni',
                'japan_goal' => 'Bekerja di Sektor Manufaktur Mesin Presisi Jepang',
                'message' => 'Ingin mendaftar kelas pagi dan siap mengikuti seluruh tata tertib kedisiplinan asrama.',
                'status' => 'pending',
                'registration_date' => now()->subDays(3),
                'notes' => 'Menunggu konfirmasi jadwal tes penempatan awal.',
                'admin_notes' => 'Menunggu konfirmasi jadwal tes penempatan awal.',
            ],
            [
                'registration_code' => 'REG-2026-00102',
                'user_id' => $userSiti ? $userSiti->id : null,
                'program_id' => $progKaigo ? $progKaigo->id : 3,
                'name' => 'Siti Nurhaliza',
                'full_name' => 'Siti Nurhaliza',
                'email' => 'siti.nurhaliza@example.test',
                'phone' => '082198765402',
                'address' => 'Jl. Caturwarga No. 45',
                'city' => 'Mataram',
                'dob' => '2001-11-20',
                'education' => 'D3 Keperawatan',
                'program_interest' => 'Kelas Pelatihan Kaigo (Caregiver)',
                'japanese_level' => 'Belajar Otodidak (Hiragana/Katakana)',
                'japan_goal' => 'Karier Profesional Perawat Lansia (Kaigo Tokutei Ginou)',
                'message' => 'Lulusan keperawatan yang ingin memperdalam bahasa Jepang dan praktik standar panti Jepang.',
                'status' => 'reviewed',
                'admin_notes' => 'Ijazah D3 Keperawatan telah diverifikasi valid. Dijadwalkan wawancara offline.',
            ],
            [
                'registration_code' => 'REG-2026-00103',
                'user_id' => $userBayu ? $userBayu->id : null,
                'program_id' => $progN4 ? $progN4->id : 2,
                'name' => 'Bayu Wicaksono',
                'full_name' => 'Bayu Wicaksono',
                'email' => 'bayu.wicaksono@example.test',
                'phone' => '087812345603',
                'address' => 'Jl. Raya Tanjung KM 15',
                'city' => 'Lombok Utara',
                'dob' => '2000-08-09',
                'education' => 'S1 Pendidikan Bahasa',
                'program_interest' => 'Kelas Intensif N4 & JFT-Basic',
                'japanese_level' => 'JLPT N5 Resmi (Lulus 2024)',
                'japan_goal' => 'Mengejar Sertifikasi N4 dan Penempatan Kerja Resmi',
                'message' => 'Sudah memiliki sertifikat N5 dan ingin langsung bergabung di kelas intensif N4.',
                'status' => 'accepted',
                'admin_notes' => 'Sertifikat N5 terlampir resmi. Dinyatakan diterima di kelas N4 Angkatan 09.',
            ],
            [
                'registration_code' => 'REG-2026-00104',
                'user_id' => $userReza ? $userReza->id : null,
                'program_id' => $progN5 ? $progN5->id : 1,
                'name' => 'Reza Kurniawan',
                'full_name' => 'Reza Kurniawan',
                'email' => 'reza.kurniawan@example.test',
                'phone' => '085912349904',
                'address' => 'Jl. Selaparang No. 8',
                'city' => 'Lombok Timur',
                'dob' => '1998-03-22',
                'education' => 'SMA IPA',
                'program_interest' => 'Kelas Reguler N5',
                'japanese_level' => 'Pemula',
                'japan_goal' => 'Program Pelatihan Kerja Luar Negeri',
                'message' => 'Tertarik mempelajari bahasa Jepang untuk persiapan peluang kerja.',
                'status' => 'rejected',
                'admin_notes' => 'Batal konfirmasi pendaftaran karena kendala domisili ke luar pulau.',
            ],
        ];

        foreach ($registrations as $item) {
            Registration::updateOrCreate(
                ['registration_code' => $item['registration_code']],
                $item
            );
        }
    }
}
