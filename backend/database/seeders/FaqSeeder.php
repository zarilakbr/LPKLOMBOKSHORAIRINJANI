<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Apakah pemula tanpa latar belakang bahasa Jepang dapat mendaftar?',
                'answer' => 'Tentu saja. Kelas dasar (N5) di LPK Lombok Shorai Rinjani dirancang secara sistematis khusus untuk pemula murni dari nol pengenalan huruf Hiragana, Katakana, hingga pembentukan kalimat percakapan bertahap.',
                'category' => 'Pendaftaran & Persyaratan',
                'sort_order' => 1,
                'order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'question' => 'Berapa lama rata-rata durasi pendidikan hingga siap mengikuti tes kerja?',
                'answer' => 'Rata-rata program persiapan intensif memakan waktu antara 4 hingga 6 bulan belajar disiplin, mencakup target kelulusan JFT-Basic A2 / JLPT N4 serta ujian evaluasi keterampilan bidang industri spesifik (Prometric Test).',
                'category' => 'Durasi & Kurikulum',
                'sort_order' => 2,
                'order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'question' => 'Apakah LPK Lombok Shorai Rinjani memberikan kepastian penempatan kerja di Jepang?',
                'answer' => 'LPK Lombok Shorai Rinjani adalah lembaga pendidikan dan pelatihan kerja resmi yang bertugas membina kompetensi bahasa, keterampilan teknis, dan etos disiplin kerja. Kelulusan wawancara dan penerimaan kerja sepenuhnya bergantung pada performa ujian resmi, kualifikasi mandiri siswa, dan keputusan institusi penerima di Jepang sesuai regulasi ketenagakerjaan kedua negara.',
                'category' => 'Karier & Regulasi',
                'sort_order' => 3,
                'order' => 3,
                'status' => 'ACTIVE',
            ],
            [
                'question' => 'Dokumen apa saja yang diperlukan untuk proses registrasi awal?',
                'answer' => 'Untuk registrasi awal, calon peserta cukup menyiapkan salinan KTP/identitas diri, ijazah pendidikan terakhir (minimal SMA/SMK/Sederajat), pasfoto terbaru, serta mengisi formulir pendaftaran konsultasi baik online maupun langsung di kantor sekretariat.',
                'category' => 'Pendaftaran & Persyaratan',
                'sort_order' => 4,
                'order' => 4,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($faqs as $item) {
            Faq::updateOrCreate(
                ['question' => $item['question']],
                $item
            );
        }
    }
}
