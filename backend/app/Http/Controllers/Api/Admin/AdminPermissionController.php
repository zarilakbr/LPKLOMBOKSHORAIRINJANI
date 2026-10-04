<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\PermissionRequestResource;
use App\Models\Attendance;
use App\Models\PermissionAttachment;
use App\Models\PermissionRequest;
use App\Services\ActivityLogService;
use Carbon\CarbonPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminPermissionController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Get paginated permission requests across the institution.
     */
    public function index(Request $request): JsonResponse
    {
        $query = PermissionRequest::with(['user:id,name,email,avatar', 'class:id,name', 'reviewer:id,name', 'attachments']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', strtolower($request->type));
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereHas('user', function ($uq) use ($term) {
                    $uq->whereRaw('LOWER(name) LIKE ?', [$term])
                       ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                })->orWhereRaw('LOWER(reason) LIKE ?', [$term]);
            });
        }

        $permissions = $query->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated(
            $permissions->through(fn ($item) => new PermissionRequestResource($item)),
            'Daftar permohonan izin siswa berhasil dimuat.'
        );
    }

    /**
     * Get detail of a permission request.
     */
    public function show(int $id): JsonResponse
    {
        $permission = PermissionRequest::with(['user', 'class', 'reviewer', 'attachments'])->find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new PermissionRequestResource($permission),
            'Detail permohonan izin berhasil dimuat.'
        );
    }

    /**
     * Review (Approve or Reject) a student permission request by Admin.
     */
    public function review(Request $request, int $id): JsonResponse
    {
        $permission = PermissionRequest::with('class')->find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'status'       => ['required', 'string', 'in:approved,rejected,APPROVED,REJECTED'],
            'review_notes' => [
                'nullable',
                'string',
                'max:1000',
                function ($attribute, $value, $fail) use ($request) {
                    if (strtolower($request->input('status', '')) === 'rejected' && empty(trim($value ?? ''))) {
                        $fail('Alasan penolakan izin wajib diisi saat menolak permohonan.');
                    }
                }
            ],
        ], [
            'status.required' => 'Status persetujuan wajib ditentukan.',
            'status.in'       => 'Status harus approved atau rejected.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi peninjauan izin gagal.', $validator->errors(), 422);
        }

        $adminId = $request->user()->id;
        $status = strtolower($request->status);
        $reviewNotes = $request->review_notes;

        $attendanceEvents = [];

        DB::transaction(function () use ($permission, $adminId, $status, $reviewNotes, &$attendanceEvents) {
            $permission->update([
                'status'       => $status,
                'review_notes' => $reviewNotes,
                'reviewed_by'  => $adminId,
                'reviewed_at'  => now(),
            ]);

            // If approved, create or update matching attendance status for each day in range
            if ($status === PermissionRequest::STATUS_APPROVED) {
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
                            'notes'       => 'Izin disetujui Admin: ' . ($permission->reason ?? ''),
                            'check_in_at' => null,
                        ]);
                        $attendanceEvents[] = new \App\Events\AttendanceUpdated($existingAtt->fresh(['user', 'class']));
                    } else {
                        $newAtt = Attendance::create([
                            'user_id'         => $permission->user_id,
                            'class_id'        => $permission->class_id,
                            'attendance_date' => $dateStr,
                            'status'          => $attendanceStatus,
                            'notes'           => 'Izin disetujui Admin: ' . ($permission->reason ?? ''),
                            'check_in_at'     => null,
                        ]);
                        $attendanceEvents[] = new \App\Events\AttendanceRecorded($newAtt->fresh(['user', 'class']));
                    }
                }
            }
        });

        foreach ($attendanceEvents as $attEvent) {
            event($attEvent);
        }

        $freshPermission = $permission->fresh(['user', 'class', 'reviewer', 'attachments']);

        // Activity log
        $actionName = $status === 'approved' ? 'APPROVE_PERMISSION' : 'REJECT_PERMISSION';
        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            $actionName,
            'Permissions',
            "Admin " . ($status === 'approved' ? 'menyetujui' : 'menolak') . " permohonan izin #{$permission->id} ({$freshPermission->user?->name})." . ($reviewNotes ? " Catatan: {$reviewNotes}" : '')
        );

        // Realtime event & notification
        event(new \App\Events\PermissionReviewed($freshPermission));

        \App\Services\RealtimeNotificationService::notifyUser(
            $freshPermission->user_id,
            'izin',
            'Tinjauan Permohonan Izin Administrator',
            "Permohonan izin Anda telah ditinjau oleh Administrator dengan status: " . strtoupper($status) . ".",
            '/dashboard/permission'
        );

        return $this->sendResponse(
            new PermissionRequestResource($freshPermission),
            'Tinjauan permohonan izin berhasil disimpan.'
        );
    }

    /**
     * Convenience endpoint: Approve permission.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $request->merge(['status' => 'approved']);
        return $this->review($request, $id);
    }

    /**
     * Convenience endpoint: Reject permission.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $request->merge(['status' => 'rejected']);
        return $this->review($request, $id);
    }

    /**
     * Securely download supporting attachment by Admin.
     */
    public function downloadAttachment(Request $request, int $permissionId, int $attachmentId): StreamedResponse|JsonResponse
    {
        $permission = PermissionRequest::find($permissionId);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
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
            return $this->sendError('Berkas fisik lampiran tidak ditemukan di penyimpanan server.', [], 404);
        }

        return Storage::disk($disk)->download(
            $attachment->file_path,
            $attachment->file_name ?: basename($attachment->file_path)
        );
    }
}
