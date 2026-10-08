<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Hanya menjalankan seeder esensial (Admin/Pengajar & Pengaturan Resmi Lembaga).
     * Data siswa, pendaftaran, dan data demo tidak dijalankan otomatis.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,        // Akun Administrator & Pengajar Lembaga
            SiteSettingSeeder::class, // Pengaturan Kontak & Identitas Resmi LPK
            ProgramSeeder::class,     // Program Pelatihan Resmi LPK
            FacilitySeeder::class,    // Fasilitas Gedung Pelatihan
            FaqSeeder::class,         // Informasi FAQ Resmi
            ArticleSeeder::class,     // Artikel & Panduan Resmi
            GallerySeeder::class,     // Galeri Dokumentasi Resmi
        ]);
    }
}
