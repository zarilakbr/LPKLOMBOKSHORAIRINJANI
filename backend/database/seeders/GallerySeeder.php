<?php

namespace Database\Seeders;

use App\Models\Gallery;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gallery = [
            [
                'title' => 'Suasana Pembelajaran Intensif di Kelas Teori Fuji',
                'category' => 'Kegiatan Kelas',
                'image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
                'description' => 'Sesi interaktif bimbingan tata bahasa dan kanji bersama sensei di ruang kelas teori.',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Simulasi Praktik Keperawatan di Mockup Nursing Care Dojo',
                'category' => 'Praktik Teknis',
                'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
                'description' => 'Pelatihan teknik pendampingan lansia menggunakan tempat tidur medis dan kursi roda standar Jepang.',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Simulasi Ujian Berbasis Komputer (CBT Laboratory)',
                'category' => 'Fasilitas & Ujian',
                'image' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
                'description' => 'Latihan berkala menghadapi format ujian resmi JFT-Basic dan Prometric skill test.',
                'sort_order' => 3,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Sesi Konsultasi Rencana Karier & Minat Sektor Kerja',
                'category' => 'Konsultasi',
                'image' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
                'description' => 'Pendampingan one-on-one untuk memetakan kesiapan bahasa dan pemilihan bidang kerja tujuan.',
                'sort_order' => 4,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($gallery as $item) {
            Gallery::updateOrCreate(
                ['title' => $item['title']],
                $item
            );
        }
    }
}
