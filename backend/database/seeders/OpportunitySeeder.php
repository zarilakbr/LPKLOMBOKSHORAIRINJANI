<?php

namespace Database\Seeders;

use App\Models\Opportunity;
use Illuminate\Database\Seeder;

class OpportunitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $opportunities = [
            [
                'title' => 'Contoh Peluang - Perawat Lansia (Kaigo)',
                'slug' => 'contoh-peluang-perawat-lansia-kaigo',
                'company_name' => 'Fasilitas Panti Demo Prefektur Kanagawa',
                'sector' => 'Keperawatan (Kaigo)',
                'location' => 'Yokohama, Prefektur Kanagawa (Contoh Wilayah)',
                'employment_type' => 'Tokutei Ginou 1 (SSW)',
                'salary_range' => '¥215.000 - ¥250.000 / Bulan (Estimasi Sampel)',
                'language_req' => 'JFT-Basic A2 / JLPT N4 + Sertifikat Skill Kaigo Prometric',
                'age_req' => 'Usia 19 - 34 Tahun',
                'description' => 'Contoh lowongan percontohan untuk posisi perawatan lansia (Kaigo). Bertugas mendampingi aktivitas harian penghuni panti, membantu mobilitas kursi roda, serta mencatat laporan kondisi harian dengan format Horenso.',
                'requirements' => [
                    'Sertifikat Kelulusan Ujian Evaluasi Keterampilan Kaigo (Skill Test)',
                    'Sertifikat Kemampuan Bahasa Jepang JFT-Basic A2 atau JLPT N4',
                    'Kesehatan jasmani dan bebas dari penyakit kronis/menular',
                    'Komitmen menjalani kontrak kerja resmi selama 3 - 5 tahun di Jepang',
                ],
                'benefits' => [
                    'Asuransi sosial & kesehatan nasional Jepang (Shakai Hoken)',
                    'Subsidi tempat tinggal (Apato) bersubsidi',
                    'Tunjangan lembur dan tunjangan shift malam sesuai hukum ketenagakerjaan Jepang',
                    'Bonus akhir tahun berdasarkan performa evaluasi institusi',
                ],
                'deadline' => now()->addDays(45)->format('Y-m-d'),
                'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
                'status' => 'OPEN',
            ],
            [
                'title' => 'Contoh Peluang - Manufaktur Komponen Mesin Presisi',
                'slug' => 'contoh-peluang-manufaktur-komponen-mesin-presisi',
                'company_name' => 'Industri Manufaktur Sampel Prefektur Aichi',
                'sector' => 'Manufaktur Mesin & Otomotif',
                'location' => 'Nagoya, Prefektur Aichi (Contoh Wilayah)',
                'employment_type' => 'Tokutei Ginou 1 (SSW)',
                'salary_range' => '¥220.000 - ¥265.000 / Bulan (Estimasi Sampel)',
                'language_req' => 'JFT-Basic A2 / JLPT N4 + Sertifikat Skill Manufaktur',
                'age_req' => 'Usia 18 - 32 Tahun',
                'description' => 'Contoh lowongan percontohan untuk pengoperasian mesin bubut, milling, dan inspeksi komponen presisi. Lingkungan kerja mengutamakan standar keselamatan tinggi dan kedisiplinan 5S.',
                'requirements' => [
                    'Lulus Ujian Evaluasi Keahlian Bidang Manufaktur (Manufacturing Skill Test)',
                    'Lulus Tes Bahasa Jepang JFT-Basic A2 atau JLPT N4',
                    'Memiliki ketahanan fisik prima dan ketelitian tinggi',
                    'Mampu bekerja dalam tim dengan rotasi shift standar pabrik',
                ],
                'benefits' => [
                    'Pelatihan pengoperasian mesin berlisensi pabrik',
                    'Disediakan asrama pekerja berfasilitas lengkap',
                    'Asuransi kecelakaan kerja dan pensiun nasional (Nenkin)',
                    'Tunjangan transportasi harian',
                ],
                'deadline' => now()->addDays(60)->format('Y-m-d'),
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                'status' => 'OPEN',
            ],
            [
                'title' => 'Contoh Peluang - Industri Pengolahan Makanan & Minuman',
                'slug' => 'contoh-peluang-industri-pengolahan-makanan-dan-minuman',
                'company_name' => 'Sentra Produksi Makanan Sampel Saitama',
                'sector' => 'Pengolahan Makanan (Food Manufacturing)',
                'location' => 'Saitama, Wilayah Kanto (Contoh Wilayah)',
                'employment_type' => 'Tokutei Ginou 1 (SSW)',
                'salary_range' => '¥205.000 - ¥240.000 / Bulan (Estimasi Sampel)',
                'language_req' => 'JFT-Basic A2 / JLPT N4 + Sertifikat Food Service Skill',
                'age_req' => 'Usia 18 - 35 Tahun',
                'description' => 'Contoh posisi percontohan di lini perakitan makanan siap saji, pengemasan steril, dan pengawasan mutu higienis sesuai regulasi sanitasi Jepang (HACCP).',
                'requirements' => [
                    'Sertifikat Keterampilan Pengolahan Makanan & Minuman Prometric',
                    'Sertifikat Kemampuan Bahasa Jepang JFT-Basic / N4',
                    'Tinggi standar kebersihan pribadi dan disiplin kepatuhan sanitasi',
                ],
                'benefits' => [
                    'Makan siang bersubsidi di kantin pabrik',
                    'Asuransi kesehatan dan keselamatan kerja lengkap',
                    'Fasilitas antar-jemput asrama ke lokasi pabrik',
                ],
                'deadline' => now()->addDays(30)->format('Y-m-d'),
                'image' => 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
                'status' => 'OPEN',
            ],
        ];

        foreach ($opportunities as $item) {
            Opportunity::updateOrCreate(
                ['slug' => $item['slug']],
                $item
            );
        }
    }
}
