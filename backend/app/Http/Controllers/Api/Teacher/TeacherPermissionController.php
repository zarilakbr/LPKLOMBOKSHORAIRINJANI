<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Teacher\TeacherReviewPermissionRequest;
use App\Http\Resources\PermissionRequestResource;
use App\Models\Attendance;
use App\Models\PermissionAttachment;
use App\Models\PermissionRequest;
use App\Models\ProgramClass;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherPermissionController extends BaseApiController
{
    /**
     * Get permission requests submitted for classes taught by this teacher.
     */
    public function index(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        $teacherClassIds = ProgramClass::where('teacher_id', $teacherId)->pluck('id');

        $query = PermissionRequest::whereIn('class_id', $teacherClassIds)
            ->with(['user:id,name,email,avatar', 'class:id,name', 'attachments']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', strtolower($request->type));
        }

        if ($request->filled('class_id')) {
            if (!$teacherClassIds->contains($request->class_id)) {
                return $this->sendError('Akses ditolak. Kelas bukan merupakan kelas bimbingan Anda.', [], 403);
            }
            $query->where('class_id', $request->class_id);
        }

        $permissions = $query->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated(
            $permissions->through(fn ($item) => new PermissionRequestResource($item)),
            'Daftar permohonan izin siswa berhasil dimuat.'
        );
    }

    /**
     * Get detail of a specific permission request.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $permission = PermissionRequest::with(['user', 'class', 'reviewer', 'attachments'])->find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict Resource Ownership Check (IDOR Protection)
        if (!$permission->class || $permission->class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Permohonan izin ini ditujukan untuk kelas pengajar lain.', [], 403);
        }

        return $this->sendResponse(new PermissionRequestResource($permission), 'Detail permohonan izin berhasil dimuat.');
    }

    /**
     * Review (Approve or Reject) a student permission request.
     */
    public function review(TeacherReviewPermissionRequest $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;
        $validated = $request->validated();

        $permission = PermissionRequest::with('class')->find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict Ownership Check
        if (!$permission->class || $permission->class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak meninjau permohonan izin pada kelas pengajar lain.', [], 403);
        }

        // Verify Student has ACTIVE Enrollment in this class
        $isEnrolled = \App\Models\Enrollment::where('user_id', $permission->user_id)
            ->where('class_id', $permission->class_id)
            ->where('status', \App\Models\Enrollment::STATUS_ACTIVE)
            ->exists();

        if (!$isEnrolled) {
            return $this->sendError('Akses ditolak. Siswa tidak memiliki pendaftaran aktif pada kelas ini.', [], 403);
        }

        $attendanceEvents = [];

        DB::transaction(function () use ($permission, $teacherId, $validated, &$attendanceEvents) {
            $permission->update([
                'status'       => $validated['status'],
                'review_notes' => $validated['review_notes'] ?? null,
                'reviewed_by'  => $teacherId,
                'reviewed_at'  => now(),
            ]);

            // If approved, create or update matching attendance status for every date in range
            if ($validated['status'] === PermissionRequest::STATUS_APPROVED) {
                $attendanceStatus = ($permission->type === PermissionRequest::TYPE_SAKIT)
                    ? Attendance::STATUS_SAKIT
                    : Attendance::STATUS_IZIN;

                $startDate = $permission->start_date->copy()->startOfDay();
                $endDate = ($permission->end_date && $permission->end_date->gte($startDate))
                    ? $permission->end_date->copy()->startOfDay()
                    : $startDate;

                $period = CarbonPeriod::create($startDate, $endDate);

                foreach ($period as $date) {
                    $dateStr = $date->format('Y-m-d');
                    $existingAtt = Attendance::where('user_id', $permission->user_id)
                        ->where('class_id', $permission->class_id)
                        ->whereDate('attendance_date', $dateStr)
                        ->first();

                    if ($existingAtt) {
                        $existingAtt->update([
                            'status'      => $attendanceStatus,
                            'notes'       => 'Izin disetujui: ' . ($permission->reason ?? ''),
                            'check_in_at' => null,
                        ]);
                        $attendanceEvents[] = new \App\Events\AttendanceUpdated($existingAtt->fresh(['user', 'class']));
                    } else {
                        $newAtt = Attendance::create([
                            'user_id'         => $permission->user_id,
                            'class_id'        => $permission->class_id,
                            'attendance_date' => $dateStr,
                            'status'          => $attendanceStatus,
                            'notes'           => 'Izin disetujui: ' . ($permission->reason ?? ''),
                            'check_in_at'     => null,
                        ]);
                        $attendanceEvents[] = new \App\Events\AttendanceRecorded($newAtt->fresh(['user', 'class']));
                    }
                }
            }
        });

        // Broadcast events AFTER transaction has successfully committed
        foreach ($attendanceEvents as $attEvent) {
            event($attEvent);
        }

        $freshPermission = $permission->fresh(['user', 'class', 'reviewer', 'attachments']);

        // Realtime Event Broadcast
        event(new \App\Events\PermissionReviewed($freshPermission));

        // Realtime Notification for Student
        $statusLabel = strtoupper($validated['status']);
        \App\Services\RealtimeNotificationService::notifyUser(
            $freshPermission->user_id,
            'izin',
            'Tinjauan Permohonan Izin Selesai',
            "Permohonan izin Anda telah ditinjau oleh Sensei dengan status: {$statusLabel}.",
            '/dashboard/permission'
        );

        return $this->sendResponse(
            new PermissionRequestResource($freshPermission),
            'Tinjauan permohonan izin berhasil disimpan.'
        );
    }

    /**
     * Securely download supporting attachment for teacher of the class.
     */
    public function downloadAttachment(Request $request, int $permissionId, int $attachmentId): StreamedResponse|JsonResponse
    {
        $teacherId = $request->user()->id;

        $permission = PermissionRequest::with('class')->find($permissionId);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict authorization: teacher must be assigned to this class
        if (!$permission->class || $permission->class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak mengakses dokumen permohonan kelas ini.', [], 403);
        }

        $attachment = PermissionAttachment::where('id', $attachmentId)
            ->where('permission_request_id', $permission->id)
            ->first();

        if (!$attachment) {
            return $this->sendError('Berkas lampiran tidak ditemukan.', [], 404);
        }

        $disk = Storage::disk('local')->exists($attachment->file_path)
            ? 'local'
            : (Storage::disk('public')->exists($attachment->file_path) ? 'public' : null);

        if (!$disk) {
            return $this->sendError('Berkas fisik lampiran tidak ditemukan di server penyimpanan.', [], 404);
        }

        return Storage::disk($disk)->download(
            $attachment->file_path,
            $attachment->file_name ?: basename($attachment->file_path)
        );
    }
}
