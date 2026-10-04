<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Student\StorePermissionAttachmentRequest;
use App\Http\Requests\Student\StoreStudentPermissionRequest;
use App\Http\Requests\Student\UpdateStudentPermissionRequest;
use App\Http\Resources\PermissionAttachmentResource;
use App\Http\Resources\PermissionRequestResource;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\PermissionAttachment;
use App\Models\PermissionRequest;
use App\Models\ProgramClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentPermissionController extends BaseApiController
{
    /**
     * Get all permission requests filed by the student.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = PermissionRequest::where('user_id', $userId)
            ->with(['class:id,name', 'reviewer:id,name', 'attachments']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtolower($request->status));
        }

        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', strtolower($request->type));
        }

        $permissions = $query->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated(
            $permissions->through(fn ($item) => new PermissionRequestResource($item)),
            'Daftar permohonan izin berhasil dimuat.'
        );
    }

    /**
     * Submit a new permission request.
     */
    public function store(StoreStudentPermissionRequest $request): JsonResponse
    {
        $userId = $request->user()->id;
        $validated = $request->validated();
        $classId = (int) $validated['class_id'];

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
            return $this->sendError('Akses ditolak. Anda tidak terdaftar aktif pada kelas ini untuk mengajukan perizinan.', [], 403);
        }

        $permission = PermissionRequest::create([
            'user_id'    => $userId, // Strictly server-enforced ownership
            'class_id'   => $classId,
            'type'       => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date'   => $validated['end_date'],
            'reason'     => $validated['reason'],
            'status'     => PermissionRequest::STATUS_PENDING,
        ]);

        $loadedPermission = $permission->load(['user', 'class', 'attachments']);

        // Realtime Event Broadcast
        event(new \App\Events\PermissionCreated($loadedPermission));

        // Realtime Notification for Teacher & Admin
        $studentName = $request->user()->name;
        \App\Services\RealtimeNotificationService::notifyClassTeacher(
            $classId,
            'izin',
            'Permohonan Izin Baru',
            "Siswa {$studentName} mengajukan permohonan izin/sakit.",
            "/teacher/permissions/{$permission->id}"
        );
        \App\Services\RealtimeNotificationService::notifyAdmins(
            'izin',
            'Permohonan Izin Siswa',
            "Siswa {$studentName} mengajukan permohonan izin/sakit.",
            '/admin/classes'
        );

        return $this->sendResponse(
            new PermissionRequestResource($loadedPermission),
            'Permohonan izin berhasil diajukan dan sedang menunggu tinjauan pengajar.',
            201
        );
    }

    /**
     * Get detail of a specific permission request.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $permission = PermissionRequest::with(['class', 'reviewer', 'attachments'])->find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict IDOR Check
        if ($permission->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk melihat permohonan ini.', [], 403);
        }

        return $this->sendResponse(new PermissionRequestResource($permission), 'Detail permohonan izin berhasil dimuat.');
    }

    /**
     * Update an existing permission request (only while pending).
     */
    public function update(UpdateStudentPermissionRequest $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $permission = PermissionRequest::find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict IDOR Check
        if ($permission->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk mengubah permohonan ini.', [], 403);
        }

        // Business Rule: Cannot edit if already reviewed/processed
        if ($permission->status !== PermissionRequest::STATUS_PENDING) {
            return $this->sendError('Permohonan izin yang sudah diproses oleh pengajar tidak dapat diubah lagi.', [], 422);
        }

        $permission->update($request->validated());

        return $this->sendResponse(
            new PermissionRequestResource($permission->load(['class', 'reviewer', 'attachments'])),
            'Permohonan izin berhasil diperbarui.'
        );
    }

    /**
     * Upload supporting document attachment (doctor note, certificate, etc.).
     */
    public function uploadAttachment(StorePermissionAttachmentRequest $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $permission = PermissionRequest::find($id);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict IDOR Check
        if ($permission->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak dapat menambahkan lampiran pada permohonan ini.', [], 403);
        }

        $file = $request->file('file') ?? $request->file('attachment');
        $storedPath = $file->store('attachments/permissions', 'local');

        $attachment = PermissionAttachment::create([
            'permission_request_id' => $permission->id,
            'file_name'             => $file->getClientOriginalName(),
            'file_path'             => $storedPath,
            'mime_type'             => $file->getClientMimeType() ?: $file->getMimeType(),
            'file_size'             => $file->getSize(),
        ]);

        return $this->sendResponse(
            new PermissionAttachmentResource($attachment),
            'Dokumen bukti berhasil diunggah.',
            201
        );
    }

    /**
     * Securely download supporting attachment for student owner.
     */
    public function downloadAttachment(Request $request, int $permissionId, int $attachmentId): StreamedResponse|JsonResponse
    {
        $userId = $request->user()->id;

        $permission = PermissionRequest::find($permissionId);

        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        // Strict IDOR Check: student can only download their own permission attachments
        if ($permission->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk mengunduh lampiran ini.', [], 403);
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
