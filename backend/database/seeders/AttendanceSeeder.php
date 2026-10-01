<?php

namespace Database\Seeders;

use App\Models\Attendance;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Database\Seeder;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $student = User::where('email', 'student@example.test')->first()
            ?: User::where('role', User::ROLE_SISWA)->first();

        $class = ProgramClass::first();

        if (!$student || !$class) {
            return;
        }

        $records = [
            [
                'user_id' => $student->id,
                'class_id' => $class->id,
                'attendance_date' => now()->subDays(3)->format('Y-m-d'),
                'check_in_at' => now()->subDays(3)->setTime(8, 25, 0),
                'status' => Attendance::STATUS_HADIR,
                'notes' => 'Hadir tepat waktu di kelas teori.',
            ],
            [
                'user_id' => $student->id,
                'class_id' => $class->id,
                'attendance_date' => now()->subDays(2)->format('Y-m-d'),
                'check_in_at' => now()->subDays(2)->setTime(8, 45, 0),
                'status' => Attendance::STATUS_TERLAMBAT,
                'notes' => 'Terlambat 15 menit karena kendala transportasi.',
            ],
            [
                'user_id' => $student->id,
                'class_id' => $class->id,
                'attendance_date' => now()->subDays(1)->format('Y-m-d'),
                'check_in_at' => null,
                'status' => Attendance::STATUS_SAKIT,
                'notes' => 'Sakit demam ringan, surat dokter terlampir.',
            ],
            [
                'user_id' => $student->id,
                'class_id' => $class->id,
                'attendance_date' => now()->format('Y-m-d'),
                'check_in_at' => now()->setTime(8, 20, 0),
                'status' => Attendance::STATUS_HADIR,
                'notes' => 'Hadir sesi praktik laboratorium bahasa.',
            ],
        ];

        foreach ($records as $item) {
            $attendance = Attendance::where('user_id', $item['user_id'])
                ->where('class_id', $item['class_id'])
                ->whereDate('attendance_date', $item['attendance_date'])
                ->first();

            if ($attendance) {
                $attendance->update($item);
            } else {
                Attendance::create($item);
            }
        }
    }
}
