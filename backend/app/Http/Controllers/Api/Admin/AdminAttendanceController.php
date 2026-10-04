<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminAttendanceController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Get paginated attendance records across the entire institution.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Attendance::with(['user:id,name,email,avatar', 'class:id,name']);

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('date')) {
            $query->whereDate('attendance_date', $request->date);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereHas('user', function ($uq) use ($term) {
                    $uq->whereRaw('LOWER(name) LIKE ?', [$term])
                       ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                })->orWhereHas('class', function ($cq) use ($term) {
                    $cq->whereRaw('LOWER(name) LIKE ?', [$term]);
                });
            });
        }

        $attendances = $query->orderBy('attendance_date', 'desc')->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated(
            $attendances->through(fn ($item) => new AttendanceResource($item)),
            'Data absensi siswa berhasil dimuat.'
        );
    }

    /**
     * Get detail of an attendance record.
     */
    public function show(int $id): JsonResponse
    {
        $attendance = Attendance::with(['user', 'class'])->find($id);

        if (!$attendance) {
            return $this->sendError('Data absensi tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new AttendanceResource($attendance),
            'Detail data absensi berhasil dimuat.'
        );
    }

    /**
     * Create or record attendance by Admin.
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (!isset($input['attendance_date']) && isset($input['date'])) {
            $input['attendance_date'] = $input['date'];
        }

        $validator = Validator::make($input, [
            'user_id'         => ['required', 'integer', 'exists:users,id'],
            'class_id'        => ['required', 'integer', 'exists:classes,id'],
            'attendance_date' => ['required', 'date_format:Y-m-d'],
            'status'          => ['required', 'string', 'in:hadir,terlambat,izin,sakit,alpa,HADIR,TERLAMBAT,IZIN,SAKIT,ALPA'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ], [
            'user_id.required'         => 'Siswa wajib dipilih.',
            'user_id.exists'           => 'Data pengguna siswa tidak ditemukan.',
            'class_id.required'        => 'Kelas wajib dipilih.',
            'class_id.exists'          => 'Data kelas tidak ditemukan.',
            'attendance_date.required' => 'Tanggal presensi wajib diisi.',
            'status.in'                => 'Status presensi harus salah satu dari: hadir, terlambat, izin, sakit, alpa.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi presensi gagal.', $validator->errors(), 422);
        }

        $student = User::find($input['user_id']);
        if (!$student || $student->role !== User::ROLE_SISWA) {
            return $this->sendError('Pengguna yang dipilih bukan siswa yang sah.', [], 422);
        }

        $class = ProgramClass::find($input['class_id']);

        $existing = Attendance::where('user_id', $student->id)
            ->where('class_id', $class->id)
            ->whereDate('attendance_date', $input['attendance_date'])
            ->first();

        $statusStr = strtolower($input['status']);
        $notesStr = $input['notes'] ?? null;

        if ($existing) {
            $existing->update([
                'status'      => $statusStr,
                'notes'       => $notesStr,
                'check_in_at' => in_array($statusStr, ['hadir', 'terlambat']) ? now() : null,
            ]);
            $attendance = $existing;
        } else {
            $attendance = Attendance::create([
                'user_id'         => $student->id,
                'class_id'        => $class->id,
                'attendance_date' => $input['attendance_date'],
                'status'          => $statusStr,
                'notes'           => $notesStr,
                'check_in_at'     => in_array($statusStr, ['hadir', 'terlambat']) ? now() : null,
            ]);
        }

        $loadedAttendance = $attendance->load(['user', 'class']);

        // Activity log
        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'RECORD_ATTENDANCE',
            'Attendance',
            "Mencatat presensi siswa {$student->name} pada kelas {$class->name} ({$attendance->attendance_date->format('Y-m-d')}): " . strtoupper($attendance->status) . "."
        );

        // Realtime broadcast & notification
        event(new \App\Events\AttendanceRecorded($loadedAttendance));

        \App\Services\RealtimeNotificationService::notifyUser(
            $student->id,
            'absensi',
            'Presensi Kelas Dicatat Admin',
            "Presensi Anda untuk tanggal {$attendance->attendance_date->format('d M Y')} dicatat sebagai " . strtoupper($attendance->status) . ".",
            '/dashboard/attendance'
        );

        return $this->sendResponse(
            new AttendanceResource($loadedAttendance),
            'Presensi siswa berhasil disimpan.',
            201
        );
    }

    /**
     * Correct/Update an attendance record by Admin.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $attendance = Attendance::with(['user', 'class'])->find($id);

        if (!$attendance) {
            return $this->sendError('Data absensi tidak ditemukan.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'          => ['sometimes', 'required', 'string', 'in:hadir,terlambat,izin,sakit,alpa,HADIR,TERLAMBAT,IZIN,SAKIT,ALPA'],
            'notes'           => ['nullable', 'string', 'max:500'],
            'attendance_date' => ['sometimes', 'date_format:Y-m-d'],
        ], [
            'status.in' => 'Status presensi harus salah satu dari: hadir, terlambat, izin, sakit, alpa.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi koreksi presensi gagal.', $validator->errors(), 422);
        }

        $oldStatus = $attendance->status;
        $updates = [];

        if ($request->has('status')) {
            $updates['status'] = strtolower($request->status);
            if (in_array(strtolower($request->status), ['hadir', 'terlambat']) && !$attendance->check_in_at) {
                $updates['check_in_at'] = now();
            }
        }

        if ($request->has('notes')) {
            $updates['notes'] = $request->notes;
        }

        if ($request->has('attendance_date')) {
            $updates['attendance_date'] = $request->attendance_date;
        }

        $attendance->update($updates);
        $freshAttendance = $attendance->fresh(['user', 'class']);

        // Activity log
        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CORRECT_ATTENDANCE',
            'Attendance',
            "Mengoreksi absensi ID {$attendance->id} siswa {$freshAttendance->user?->name} dari {$oldStatus} ke {$freshAttendance->status}."
        );

        // Realtime broadcast & notification
        event(new \App\Events\AttendanceUpdated($freshAttendance));

        \App\Services\RealtimeNotificationService::notifyUser(
            $freshAttendance->user_id,
            'absensi',
            'Koreksi Presensi Kelas',
            "Presensi Anda untuk tanggal {$freshAttendance->attendance_date?->format('d M Y')} diperbarui oleh Admin menjadi " . strtoupper($freshAttendance->status) . ".",
            '/dashboard/attendance'
        );

        return $this->sendResponse(
            new AttendanceResource($freshAttendance),
            'Koreksi data presensi siswa berhasil disimpan.'
        );
    }

    /**
     * Delete an attendance record by Admin.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $attendance = Attendance::with(['user', 'class'])->find($id);

        if (!$attendance) {
            return $this->sendError('Data absensi tidak ditemukan.', [], 404);
        }

        $studentName = $attendance->user?->name ?? 'Siswa';
        $className = $attendance->class?->name ?? 'Kelas';
        $date = $attendance->attendance_date?->format('Y-m-d');

        $attendance->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE_ATTENDANCE',
            'Attendance',
            "Menghapus data absensi siswa {$studentName} pada kelas {$className} tanggal {$date}."
        );

        return $this->sendResponse(null, 'Data presensi berhasil dihapus.');
    }
}
