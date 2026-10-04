<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Teacher\TeacherRecordAttendanceRequest;
use App\Http\Requests\Teacher\TeacherUpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherAttendanceController extends BaseApiController
{
    /**
     * Get attendance records across all classes taught by this teacher.
     */
    public function index(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        $teacherClassIds = ProgramClass::where('teacher_id', $teacherId)->pluck('id');

        $query = Attendance::whereIn('class_id', $teacherClassIds)
            ->with(['user:id,name,email,avatar', 'class:id,name']);

        if ($request->filled('class_id')) {
            // Verify teacher owns the filtered class
            if (!$teacherClassIds->contains($request->class_id)) {
                return $this->sendError('Akses ditolak. Kelas yang diminta bukan kelas bimbingan Anda.', [], 403);
            }
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('date')) {
            $query->whereDate('attendance_date', $request->date);
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->paginate(15);

        return $this->sendPaginated(
            $attendances->through(fn ($item) => new AttendanceResource($item)),
            'Data absensi siswa berhasil dimuat.'
        );
    }

    /**
     * Get attendance records for a specific class taught by this teacher.
     */
    public function classAttendance(Request $request, int $classId): JsonResponse
    {
        $teacherId = $request->user()->id;

        $class = ProgramClass::find($classId);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        // Strict Resource Ownership Check (IDOR Protection)
        if ($class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda bukan pengajar kelas ini.', [], 403);
        }

        $query = Attendance::where('class_id', $classId)
            ->with(['user:id,name,email,avatar', 'class:id,name']);

        if ($request->filled('date')) {
            $query->whereDate('attendance_date', $request->date);
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->paginate(15);

        return $this->sendPaginated(
            $attendances->through(fn ($item) => new AttendanceResource($item)),
            'Data absensi kelas berhasil dimuat.'
        );
    }

    /**
     * Record or update attendance for a student in teacher's class.
     */
    public function store(TeacherRecordAttendanceRequest $request): JsonResponse
    {
        $teacherId = $request->user()->id;
        $validated = $request->validated();

        $class = ProgramClass::find($validated['class_id']);

        // Strict Ownership Check: Teacher can only record attendance for their own classes
        if (!$class || $class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak mencatat absensi pada kelas pengajar lain.', [], 403);
        }

        // Verify targeted user is a student
        $student = User::find($validated['user_id']);
        if (!$student || $student->role !== User::ROLE_SISWA) {
            return $this->sendError('Data peserta yang dipilih bukan siswa yang sah.', [], 422);
        }

        // Verify targeted student has an ACTIVE enrollment in this class
        $isEnrolled = Enrollment::where('user_id', $student->id)
            ->where('class_id', $class->id)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();

        if (!$isEnrolled) {
            return $this->sendError('Akses ditolak. Siswa tersebut tidak terdaftar aktif pada kelas ini.', [], 422);
        }

        $existing = Attendance::where('user_id', $student->id)
            ->where('class_id', $class->id)
            ->whereDate('attendance_date', $validated['attendance_date'])
            ->first();

        if ($existing) {
            $existing->update([
                'status'      => $validated['status'],
                'notes'       => $validated['notes'] ?? null,
                'check_in_at' => now(),
            ]);
            $attendance = $existing;
        } else {
            $attendance = Attendance::create([
                'user_id'         => $student->id,
                'class_id'        => $class->id,
                'attendance_date' => $validated['attendance_date'],
                'status'          => $validated['status'],
                'notes'           => $validated['notes'] ?? null,
                'check_in_at'     => now(),
            ]);
        }

        $loadedAttendance = $attendance->load(['user', 'class']);

        // Realtime Event Broadcast
        event(new \App\Events\AttendanceRecorded($loadedAttendance));

        // Realtime Notification for Student
        $dateFormatted = $loadedAttendance->attendance_date?->format('d M Y') ?? $validated['attendance_date'];
        \App\Services\RealtimeNotificationService::notifyUser(
            $student->id,
            'absensi',
            'Presensi Kelas Dicatat',
            "Presensi Anda untuk tanggal {$dateFormatted} dicatat sebagai " . strtoupper($validated['status']) . ".",
            '/dashboard/attendance'
        );

        return $this->sendResponse(
            new AttendanceResource($loadedAttendance),
            'Presensi siswa berhasil dicatat.',
            201
        );
    }

    /**
     * Update an existing attendance record.
     */
    public function update(TeacherUpdateAttendanceRequest $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $attendance = Attendance::with('class')->find($id);

        if (!$attendance) {
            return $this->sendError('Data absensi tidak ditemukan.', [], 404);
        }

        // Strict Ownership Check: Attendance belongs to a class taught by this teacher
        if (!$attendance->class || $attendance->class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak mengubah absensi pada kelas pengajar lain.', [], 403);
        }

        $attendance->update($request->validated());
        $freshAttendance = $attendance->fresh(['user', 'class']);

        // Realtime Event Broadcast
        event(new \App\Events\AttendanceUpdated($freshAttendance));

        \App\Services\RealtimeNotificationService::notifyUser(
            $freshAttendance->user_id,
            'absensi',
            'Presensi Kelas Diperbarui',
            "Presensi Anda untuk tanggal {$freshAttendance->attendance_date?->format('d M Y')} diperbarui menjadi " . strtoupper($freshAttendance->status) . ".",
            '/dashboard/attendance'
        );

        return $this->sendResponse(
            new AttendanceResource($freshAttendance),
            'Data presensi siswa berhasil diperbarui.'
        );
    }
}
