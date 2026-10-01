<?php

namespace Database\Seeders;

use App\Models\Contact;
use Illuminate\Database\Seeder;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contacts = [
            [
                'name' => 'Hendro Purnomo',
                'email' => 'hendro.p@example.test',
                'phone' => '081398765011',
                'subject' => 'Informasi Jadwal Kelas Malam atau Akhir Pekan',
                'message' => 'Selamat siang admin LPK Lombok Shorai Rinjani, apakah tersedia kelas bahasa Jepang yang diadakan di akhir pekan untuk karyawan yang sedang bekerja?',
                'status' => 'unread',
            ],
            [
                'name' => 'Ibu Marlina (Orang Tua Calon Siswa)',
                'email' => 'marlina.ortu@example.test',
                'phone' => '082234567022',
                'subject' => 'Konsultasi Program Kaigo untuk Putri Kami',
                'message' => 'Kami ingin berkonsultasi mengenai persyaratan fisik dan estimasi waktu bimbingan program keperawatan lansia di kampus Mataram.',
                'status' => 'read',
            ],
            [
                'name' => 'Faisal Rahman',
                'email' => 'faisal.r@example.test',
                'phone' => '087765432033',
                'subject' => 'Uji Coba Penempatan Tingkat (Placement Test)',
                'message' => 'Saya sudah pernah belajar bahasa Jepang tingkat dasar secara otodidak, apakah bisa mengikuti placement test langsung untuk masuk kelas N4?',
                'status' => 'replied',
            ],
        ];

        foreach ($contacts as $item) {
            Contact::updateOrCreate(
                [
                    'email' => $item['email'],
                    'subject' => $item['subject'],
                ],
                $item
            );
        }
    }
}
