<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@example.test')->first()
            ?: User::where('role', User::ROLE_SISWA)->first();

        $teacher = User::where('email', 'teacher@example.test')->first()
            ?: User::where('role', User::ROLE_PENGAJAR)->first();

        $admin = User::where('email', 'admin@example.test')->first()
            ?: User::where('role', User::ROLE_ADMIN)->first();

        // 1. Student Notifications
        if ($student) {
            Notification::updateOrCreate(
                [
                    'user_id' => $student->id,
                    'title' => 'Pengajuan izin sedang ditinjau',
                ],
                [
                    'type' => 'permission',
                    'message' => 'Pengajuan izin Anda untuk pengurusan dokumen paspor sedang ditinjau oleh Sensei.',
                    'is_read' => false,
                    'read_at' => null,
                    'link' => '/dashboard/izin',
                ]
            );

            Notification::updateOrCreate(
                [
                    'user_id' => $student->id,
                    'title' => 'Izin Sakit Telah Disetujui',
                ],
                [
                    'type' => 'permission',
                    'message' => 'Pengajuan izin sakit Anda telah disetujui oleh pengajar.',
                    'is_read' => true,
                    'read_at' => now()->subDay(),
                    'link' => '/dashboard/izin',
                ]
            );
        }

        // 2. Teacher Notifications
        if ($teacher) {
            Notification::updateOrCreate(
                [
                    'user_id' => $teacher->id,
                    'title' => 'Jadwal mengajar telah diperbarui',
                ],
                [
                    'type' => 'schedule',
                    'message' => 'Jadwal mengajar kelas intensif bahasa Jepang telah diperbarui untuk minggu depan.',
                    'is_read' => false,
                    'read_at' => null,
                    'link' => '/teacher/dashboard',
                ]
            );

            Notification::updateOrCreate(
                [
                    'user_id' => $teacher->id,
                    'title' => 'Pengajuan Izin Siswa Baru',
                ],
                [
                    'type' => 'permission_review',
                    'message' => 'Ada 1 permohonan izin siswa baru yang memerlukan peninjauan.',
                    'is_read' => false,
                    'read_at' => null,
                    'link' => '/teacher/dashboard',
                ]
            );
        }

        // 3. Admin Notifications
        if ($admin) {
            Notification::updateOrCreate(
                [
                    'user_id' => $admin->id,
                    'title' => 'Ada pendaftaran siswa baru',
                ],
                [
                    'type' => 'registration',
                    'message' => 'Ada pendaftaran siswa baru yang masuk ke sistem dan memerlukan verifikasi.',
                    'is_read' => false,
                    'read_at' => null,
                    'link' => '/admin/registrations',
                ]
            );

            Notification::updateOrCreate(
                [
                    'user_id' => $admin->id,
                    'title' => 'Pesan Kontak Masuk',
                ],
                [
                    'type' => 'contact',
                    'message' => 'Pertanyaan baru diterima melalui form kontak publik website.',
                    'is_read' => true,
                    'read_at' => now()->subHours(4),
                    'link' => '/admin/contacts',
                ]
            );
        }
    }
}
