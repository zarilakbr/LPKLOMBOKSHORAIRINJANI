<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $facilities = [
            [
                'name' => 'Ruang Kelas Teori Fuji & Sakura',
                'category' => 'Akademik',
                'description' => 'Ruang belajar berpendingin udara (AC) dengan pencahayaan alami, meja ergonomis, dan smart display interaktif untuk bimbingan tata bahasa intensif.',
                'image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 1,
                'order' => 1,
            ],
            [
                'name' => 'Laboratorium Komputer & CBT Simulation',
                'category' => 'Teknologi Ujian',
                'description' => '30 unit komputer berspesifikasi modern dengan antarmuka dan software simulasi resmi format tes Prometric dan JFT-Basic.',
                'image' => 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 2,
                'order' => 2,
            ],
            [
                'name' => 'Mockup Nursing Care (Kaigo) Dojo',
                'category' => 'Praktik Kejuruan',
                'description' => 'Ruang peragaan berstandar panti lansia Jepang lengkap dengan ranjang elektrik medis, simulator manekin, dan peralatan sanitasi pasien.',
                'image' => 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 3,
                'order' => 3,
            ],
            [
                'name' => 'Ruang Konsultasi & Studio Wawancara Resmi',
                'category' => 'Karier & Wawancara',
                'description' => 'Studio kedap suara dengan sistem audio-visual terkalibrasi untuk bimbingan wawancara kerja (Mensetsu) bersama pihak penerima di Jepang.',
                'image' => 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
                'status' => 'ACTIVE',
                'sort_order' => 4,
                'order' => 4,
            ],
        ];

        foreach ($facilities as $item) {
            Facility::updateOrCreate(
                ['name' => $item['name']],
                $item
            );
        }
    }
}
