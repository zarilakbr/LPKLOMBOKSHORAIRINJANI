<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Seeder;

class ActivityLogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.test')->first()
            ?: User::where('role', User::ROLE_ADMIN)->first();

        $logs = [
            [
                'user_id' => $admin ? $admin->id : 1,
                'user_name' => $admin ? $admin->name : 'Administrator Lembaga',
                'action' => 'SYSTEM_INIT',
                'module' => 'System Settings',
                'entity_type' => 'SiteSetting',
                'entity_id' => 1,
                'description' => 'Konfigurasi identitas kelembagaan resmi LPK Lombok Shorai Rinjani berhasil diinisialisasi.',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Console Seeder Runner',
            ],
            [
                'user_id' => $admin ? $admin->id : 1,
                'user_name' => $admin ? $admin->name : 'Administrator Lembaga',
                'action' => 'CREATE_PROGRAM',
                'module' => 'Academic Curriculum',
                'entity_type' => 'Program',
                'entity_id' => 1,
                'description' => 'Menambahkan silabus program demo pelatihan Bahasa Jepang Tingkat Dasar (N5).',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Console Seeder Runner',
            ],
            [
                'user_id' => $admin ? $admin->id : 1,
                'user_name' => $admin ? $admin->name : 'Administrator Lembaga',
                'action' => 'UPDATE_REGISTRATION',
                'module' => 'Admissions',
                'entity_type' => 'Registration',
                'entity_id' => 1,
                'description' => 'Memvalidasi kelengkapan berkas registrasi calon siswa demonstrasi.',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Console Seeder Runner',
            ],
        ];

        foreach ($logs as $item) {
            ActivityLog::create($item);
        }
    }
}
