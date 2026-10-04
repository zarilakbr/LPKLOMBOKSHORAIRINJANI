<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Student\StudentCheckInRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\PermissionRequest;
use App\Models\ProgramClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentAttendanceController extends BaseApiController
{
    /**
     * Get the authenticated student's attendance history and summary.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = Attendance::where('user_id', $userId)->with('class:id,name');

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('start_date')) {
            $query->whereDate('attendance_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('attendance_date', '<=', $request->end_date);
        }

        // Summary calculations
        $stats = [
            'total'     => Attendance::where('user_id', $userId)->count(),
            'hadir'     => Attendance::where('user_id', $userId)->where('status', Attendance::STATUS_HADIR)->count(),
            'terlambat' => Attendance::where('user_id', $userId)->where('status', Attendance::STATUS_TERLAMBAT)->count(),
            'izin'      => Attendance::where('user_id', $userId)->where('status', Attendance::STATUS_IZIN)->count(),
            'sakit'     => Attendance::where('user_id', $userId)->where('status', Attendance::STATUS_SAKIT)->count(),
            'alpa'      => Attendance::where('user_id', $userId)->where('status', Attendance::STATUS_ALPA)->count(),
        ];

        $attendances = $query->orderBy('attendance_date', 'desc')->paginate(15);

        return response()->json([
            'success' => true,
            'message' => 'Riwayat kehadiran siswa berhasil dimuat.',
            'summary' => $stats,
            'data'    => $attendances->items(),
            'meta'    => [
                'current_page' => $attendances->currentPage(),
                'last_page'    => $attendances->lastPage(),
                'per_page'     => $attendances->perPage(),
                'total'        => $attendances->total(),
            ]
        ], 200);
    }

    /**
     * Get detail of a single attendance record owned by student.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $attendance = Attendance::with(['class', 'user'])->find($id);

        if (!$attendance) {
            return $this->sendError('Data absensi tidak ditemukan.', [], 404);
        }

        // IDOR Protection: Student can only view their own attendance
        if ($attendance->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk melihat data absensi ini.', [], 403);
        }

        return $this->sendResponse(new AttendanceResource($attendance), 'Detail absensi berhasil dimuat.');
    }

    /**
     * Student self check-in for today's class.
     */
    public function checkIn(StudentCheckInRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $classId = (int) $request->validated('class_id');

        $class = ProgramClass::find($classId);
        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        // Verify student has an ACTIVE enrollment in the class (FAIL CLOSED)
        $isEnrolled = Enrollment::where('user_id', $userId)
            ->where('class_id', $classId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();

        if (!$isEnrolled) {
            return $this->sendError('Akses ditolak. Anda tidak terdaftar aktif pada kelas ini untuk melakukan presensi.', [], 403);
        }

        $today = now()->format('Y-m-d');

        // Check for existing attendance record on same class and date
        $existing = Attendance::where('user_id', $userId)
            ->where('class_id', $classId)
            ->whereDate('attendance_date', $today)
            ->first();

        if ($existing) {
            return $this->sendError('Anda sudah melakukan absensi untuk kelas ini hari ini.', [
                'existing' => new AttendanceResource($existing)
            ], 422);
        }

        $attendance = Attendance::create([
            'user_id'         => $userId, // Strictly server-enforced authenticated student
            'class_id'        => $classId,
            'attendance_date' => $today,
            'check_in_at'     => now(),
            'status'          => Attendance::STATUS_HADIR,
            'notes'           => $request->input('notes', 'Presensi mandiri via sistem portal siswa.'),
        ]);

        $loadedAttendance = $attendance->load(['class', 'user']);

        // Realtime Event Broadcast
        event(new \App\Events\AttendanceRecorded($loadedAttendance));

        // Realtime Notification for Teacher of this class
        \App\Services\RealtimeNotificationService::notifyClassTeacher(
            $classId,
            'absensi',
            'Presensi Mandiri Siswa',
            "Siswa {$request->user()->name} telah melakukan presensi mandiri pada {$today}.",
            "/teacher/classes/{$classId}/attendance"
        );

        return $this->sendResponse(
            new AttendanceResource($loadedAttendance),
            'Presensi harian berhasil dicatat.',
            201
        );
    }
}
