<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'Alumni Sampel A (Data Demo Pelatihan)',
                'role' => 'Contoh Peserta Sektor Manufaktur',
                'program' => 'Demo Program Intensif N4',
                'placement' => 'Wilayah Aichi (Contoh Penempatan)',
                'quote' => 'Contoh kutipan testimoni demo: Bimbingan sensei sangat disiplin dan terarah, membantu memahami tata bahasa dasar dan persiapan ujian teknis dengan baik.',
                'content' => 'Contoh kutipan testimoni demo: Bimbingan sensei sangat disiplin dan terarah, membantu memahami tata bahasa dasar dan persiapan ujian teknis dengan baik.',
                'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
                'year' => '2025 (Demo)',
                'badge' => 'Demo Alumni',
                'status' => 'PUBLISHED',
                'sort_order' => 1,
            ],
            [
                'name' => 'Alumni Sampel B (Data Demo Pelatihan)',
                'role' => 'Contoh Peserta Sektor Kaigo',
                'program' => 'Demo Program Kaigo Caregiver',
                'placement' => 'Wilayah Kanagawa (Contoh Penempatan)',
                'quote' => 'Contoh kutipan testimoni demo: Latihan simulasi di dojo keperawatan sangat membantu mengenal istilah teknis medis dan etos kerja pelayanan lansia di Jepang.',
                'content' => 'Contoh kutipan testimoni demo: Latihan simulasi di dojo keperawatan sangat membantu mengenal istilah teknis medis dan etos kerja pelayanan lansia di Jepang.',
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                'year' => '2025 (Demo)',
                'badge' => 'Demo Alumni',
                'status' => 'PUBLISHED',
                'sort_order' => 2,
            ],
            [
                'name' => 'Siswa Sampel C (Data Demo Kelas Aktif)',
                'role' => 'Contoh Siswa Kelas Dasar N5',
                'program' => 'Demo Program Reguler N5',
                'placement' => 'Mataram (Siswa Aktif)',
                'quote' => 'Contoh kutipan testimoni demo: Belajar dari nol huruf Hiragana hingga mampu membaca teks pendek dalam beberapa pekan pertama dengan bimbingan teratur.',
                'content' => 'Contoh kutipan testimoni demo: Belajar dari nol huruf Hiragana hingga mampu membaca teks pendek dalam beberapa pekan pertama dengan bimbingan teratur.',
                'photo' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
                'year' => '2026 (Demo)',
                'badge' => 'Demo Siswa Aktif',
                'status' => 'PUBLISHED',
                'sort_order' => 3,
            ],
        ];

        foreach ($testimonials as $item) {
            Testimonial::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}
