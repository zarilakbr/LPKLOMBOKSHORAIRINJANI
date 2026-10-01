<?php

namespace Database\Seeders;

use App\Models\PermissionAttachment;
use App\Models\PermissionRequest;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class PermissionRequestSeeder extends Seeder
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

        $class = ProgramClass::first();

        if (!$student || !$class) {
            return;
        }

        // 1. Approved request with attachment metadata
        $startDate1 = now()->subDays(2)->format('Y-m-d');
        $approvedReq = PermissionRequest::where('user_id', $student->id)
            ->where('class_id', $class->id)
            ->where('type', PermissionRequest::TYPE_SAKIT)
            ->whereDate('start_date', $startDate1)
            ->first();

        $data1 = [
            'user_id' => $student->id,
            'class_id' => $class->id,
            'type' => PermissionRequest::TYPE_SAKIT,
            'start_date' => $startDate1,
            'end_date' => now()->subDays(1)->format('Y-m-d'),
            'reason' => 'Demam dan flu tinggi, disarankan istirahat dokter selama 2 hari.',
            'status' => PermissionRequest::STATUS_APPROVED,
            'reviewed_by' => $teacher ? $teacher->id : null,
            'reviewed_at' => now()->subDays(2)->setTime(10, 0, 0),
            'review_notes' => 'Izin disetujui. Harap istirahat dan mengejar materi bab 8.',
        ];

        if ($approvedReq) {
            $approvedReq->update($data1);
        } else {
            $approvedReq = PermissionRequest::create($data1);
        }

        PermissionAttachment::updateOrCreate(
            [
                'permission_request_id' => $approvedReq->id,
                'file_name' => 'surat_keterangan_dokter_demo.pdf',
            ],
            [
                'file_path' => 'demo/permissions/surat_keterangan_dokter_demo.pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 148520,
            ]
        );

        // 2. Pending request (under review)
        $startDate2 = now()->addDays(2)->format('Y-m-d');
        $pendingReq = PermissionRequest::where('user_id', $student->id)
            ->where('class_id', $class->id)
            ->where('type', PermissionRequest::TYPE_IZIN)
            ->whereDate('start_date', $startDate2)
            ->first();

        $data2 = [
            'user_id' => $student->id,
            'class_id' => $class->id,
            'type' => PermissionRequest::TYPE_IZIN,
            'start_date' => $startDate2,
            'end_date' => now()->addDays(2)->format('Y-m-d'),
            'reason' => 'Keperluan pengurusan dokumen paspor dan legalisir ijazah di kantor imigrasi.',
            'status' => PermissionRequest::STATUS_PENDING,
            'reviewed_by' => null,
            'reviewed_at' => null,
            'review_notes' => null,
        ];

        if ($pendingReq) {
            $pendingReq->update($data2);
        } else {
            PermissionRequest::create($data2);
        }

        // 3. Rejected request
        $startDate3 = now()->subDays(10)->format('Y-m-d');
        $rejectedReq = PermissionRequest::where('user_id', $student->id)
            ->where('class_id', $class->id)
            ->where('type', PermissionRequest::TYPE_KEPERLUAN_KELUARGA)
            ->whereDate('start_date', $startDate3)
            ->first();

        $data3 = [
            'user_id' => $student->id,
            'class_id' => $class->id,
            'type' => PermissionRequest::TYPE_KEPERLUAN_KELUARGA,
            'start_date' => $startDate3,
            'end_date' => now()->subDays(9)->format('Y-m-d'),
            'reason' => 'Acara keluarga mendadak di luar kota.',
            'status' => PermissionRequest::STATUS_REJECTED,
            'reviewed_by' => $teacher ? $teacher->id : null,
            'reviewed_at' => now()->subDays(10)->setTime(14, 0, 0),
            'review_notes' => 'Pengajuan ditolak karena bertepatan dengan simulasi ujian evaluasi tengah semester.',
        ];

        if ($rejectedReq) {
            $rejectedReq->update($data3);
        } else {
            PermissionRequest::create($data3);
        }
    }
}
