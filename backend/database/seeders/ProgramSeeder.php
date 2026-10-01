<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            [
                'title' => 'Demo - Bahasa Jepang Dasar (N5)',
                'slug' => 'demo-bahasa-jepang-dasar-n5',
                'category' => 'Reguler',
                'level' => 'N5 (Pemula)',
                'short_description' => 'Program pelatihan demo penguasaan huruf Hiragana, Katakana, kanji dasar, dan percakapan harian level N5.',
                'description' => 'Program percontohan ini dirancang untuk peserta tanpa latar belakang bahasa Jepang. Pembelajaran dimulai dari pengenalan sistem penulisan aksara Jepang, tata bahasa dasar Minna no Nihongo I, serta latihan mendengar intonasi percakapan resmi.',
                'duration' => '3 Bulan (120 Jam Belajar)',
                'schedule' => 'Senin - Kamis (08:30 - 12:00 WITA)',
                'curriculum' => [
                    'Penguasaan Huruf Hiragana & Katakana',
                    '80 Kanji Dasar & Kosakata Harian',
                    'Pola Kalimat Tata Bahasa Minna no Nihongo I (Bab 1 - 25)',
                    'Latihan Pendengaran (Choukai) & Simulasi JLPT N5',
                ],
                'target_audience' => 'Pemula murni, lulusan SMA/SMK/Sederajat yang ingin memulai fondasi studi bahasa Jepang.',
                'price_estimate' => 'Rp 3.500.000 / Tingkat',
                'badge' => 'Demo Kelas Dasar',
                'image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 1,
                'order' => 1,
            ],
            [
                'title' => 'Demo - Bahasa Jepang Pra-Menengah (N4)',
                'slug' => 'demo-bahasa-jepang-pra-menengah-n4',
                'category' => 'Intensif',
                'level' => 'N4 (Pra-Menengah)',
                'short_description' => 'Program pelatihan demo percepatan syarat standar kerja visa Tokutei Ginou dan persiapan ujian JFT-Basic A2.',
                'description' => 'Program lanjutan intensif berfokus pada penguasaan 300 kanji, tata bahasa kerja, dan latihan soal standar JFT-Basic / JLPT N4 sebagai prasyarat administratif penempatan kerja ke Jepang.',
                'duration' => '3 Bulan (140 Jam Belajar)',
                'schedule' => 'Senin - Jumat (08:30 - 13:00 WITA)',
                'curriculum' => [
                    'Minna no Nihongo II (Bab 26 - 50)',
                    'Penguasaan 220 Kanji Lanjutan Level N4',
                    'Strategi Bedah Soal JFT-Basic & Prometric Test',
                    'Latihan Wawancara Kerja (Mensetsu Training)',
                ],
                'target_audience' => 'Peserta yang telah menguasai N5 dan mempersiapkan diri mengikuti seleksi kerja Tokutei Ginou.',
                'price_estimate' => 'Rp 4.200.000 / Tingkat',
                'badge' => 'Demo Kelas Syarat SSW',
                'image' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 2,
                'order' => 2,
            ],
            [
                'title' => 'Demo - Tokutei Ginou Kaigo (Caregiver)',
                'slug' => 'demo-tokutei-ginou-kaigo-caregiver',
                'category' => 'Keahlian Khusus',
                'level' => 'N4 + Skill Kaigo',
                'short_description' => 'Program pelatihan demo keterampilan perawatan lansia terpadu dengan simulasi dojo peralatan standar panti Jepang.',
                'description' => 'Pelatihan teori dan praktik perawatan lansia (Kaigo No Gyoumu) yang mencakup etika merawat, komunikasi empati, teknik transfer kursi roda, dan terminologi medis dasar bahasa Jepang.',
                'duration' => '4 Bulan (180 Jam Belajar & Praktik)',
                'schedule' => 'Senin - Jumat (08:00 - 14:00 WITA)',
                'curriculum' => [
                    'Bahasa Jepang Khusus Keperawatan (Kaigo no Kotoba)',
                    'Praktik Simulasi Transfer Pasien & Kursi Roda',
                    'Pemahaman Budaya & Hak Asasi Lansia di Jepang',
                    'Simulasi Ujian Evaluasi Keterampilan Kaigo Prometric',
                ],
                'target_audience' => 'Lulusan perawat, kesehatan, atau umum yang berminat berkarier resmi di sektor panti lansia Jepang.',
                'price_estimate' => 'Rp 5.500.000 / Paket',
                'badge' => 'Demo Sektor Unggulan',
                'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 3,
                'order' => 3,
            ],
            [
                'title' => 'Demo - Budaya Kerja & Etos Industri (Horenso)',
                'slug' => 'demo-budaya-kerja-dan-etos-industri-horenso',
                'category' => 'Pembekalan',
                'level' => 'Semua Tingkat',
                'short_description' => 'Program demo pembekalan adaptasi sosial, etika komunikasi Hou-Ren-So, dan tata krama kehidupan mandiri di Jepang.',
                'description' => 'Mempersiapkan mentalitas dan adaptasi siswa agar tidak mengalami kejutan budaya (*culture shock*). Siswa dibimbing mempraktikkan komunikasi kerja Houkoku-Renraku-Soudan, pemilahan sampah, dan aturan hunian apartemen di Jepang.',
                'duration' => '2 Minggu (30 Jam)',
                'schedule' => 'Sabtu & Minggu (09:00 - 15:00 WITA)',
                'curriculum' => [
                    'Prinsip Komunikasi Kerja Hou-Ren-So',
                    'Etika Keselamatan Kerja Industri (5S / 5R)',
                    'Tata Krama Hidup Bermasyarakat & Aturan Apartemen',
                    'Manajemen Keuangan Pribadi & Sistem Pajak Jepang',
                ],
                'target_audience' => 'Siswa yang telah dinyatakan lulus tes wawancara dan bersiap untuk proses pemberkasan visa.',
                'price_estimate' => 'Rp 1.500.000 / Sesi',
                'badge' => 'Demo Pembekalan',
                'image' => 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 4,
                'order' => 4,
            ],
        ];

        foreach ($programs as $item) {
            Program::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }
    }
}
