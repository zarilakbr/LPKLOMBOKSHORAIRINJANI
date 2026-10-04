<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Admin\StoreEnrollmentRequest;
use App\Http\Requests\Admin\UpdateEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\Enrollment;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminEnrollmentController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Get paginated list of enrollments with optional filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Enrollment::with(['user:id,name,email,phone,avatar,role', 'class.teacher:id,name']);

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtoupper($request->status));
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereHas('user', function ($uq) use ($term) {
                    $uq->whereRaw('LOWER(name) LIKE ?', [$term])
                       ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
                })->orWhereHas('class', function ($cq) use ($term) {
                    $cq->whereRaw('LOWER(name) LIKE ?', [$term])
                       ->orWhereRaw('LOWER(class_name) LIKE ?', [$term]);
                });
            });
        }

        $enrollments = $query->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated(
            $enrollments->through(fn ($item) => new EnrollmentResource($item)),
            'Data pendaftaran kelas siswa berhasil dimuat.'
        );
    }

    /**
     * Get detail of a specific enrollment.
     */
    public function show(int $id): JsonResponse
    {
        $enrollment = Enrollment::with(['user:id,name,email,phone,avatar,role', 'class.teacher:id,name'])->find($id);

        if (!$enrollment) {
            return $this->sendError('Data pendaftaran kelas tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new EnrollmentResource($enrollment),
            'Detail pendaftaran kelas berhasil dimuat.'
        );
    }

    /**
     * Assign a student to a class (Create Enrollment).
     */
    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $enrollment = Enrollment::create([
            'user_id'     => $validated['user_id'],
            'class_id'    => $validated['class_id'],
            'status'      => $validated['status'] ?? Enrollment::STATUS_ACTIVE,
            'enrolled_at' => $validated['enrolled_at'] ?? now(),
            'notes'       => $validated['notes'] ?? null,
        ]);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Enrollments',
            "Mendaftarkan siswa ID {$enrollment->user_id} ke kelas ID {$enrollment->class_id} (Status: {$enrollment->status})."
        );

        $loadedEnrollment = $enrollment->load(['user', 'class.teacher']);

        // Realtime Event Broadcast
        event(new \App\Events\EnrollmentCreated($loadedEnrollment));

        // Realtime Notifications for Student & Teacher
        $className = $loadedEnrollment->class?->class_name ?? $loadedEnrollment->class?->name ?? 'Kelas';
        \App\Services\RealtimeNotificationService::notifyUser(
            $loadedEnrollment->user_id,
            'kelas',
            'Pendaftaran Kelas Aktif',
            "Anda telah terdaftar aktif pada kelas {$className}.",
            '/dashboard/schedule'
        );
        \App\Services\RealtimeNotificationService::notifyClassTeacher(
            $loadedEnrollment->class_id,
            'siswa',
            'Siswa Baru Terdaftar',
            "Siswa {$loadedEnrollment->user?->name} telah didaftarkan ke kelas {$className}.",
            "/teacher/classes/{$loadedEnrollment->class_id}/students"
        );

        return $this->sendResponse(
            new EnrollmentResource($loadedEnrollment),
            'Siswa berhasil didaftarkan ke kelas.',
            201
        );
    }

    /**
     * Update an enrollment status or notes.
     */
    public function update(UpdateEnrollmentRequest $request, int $id): JsonResponse
    {
        $enrollment = Enrollment::find($id);

        if (!$enrollment) {
            return $this->sendError('Data pendaftaran kelas tidak ditemukan.', [], 404);
        }

        $validated = $request->validated();
        $oldStatus = $enrollment->status;

        // Auto-populate ended_at if transitioning away from ACTIVE
        if (isset($validated['status']) && $validated['status'] !== Enrollment::STATUS_ACTIVE && empty($validated['ended_at']) && empty($enrollment->ended_at)) {
            $validated['ended_at'] = now();
        }

        // If reactivating to ACTIVE, clear ended_at
        if (isset($validated['status']) && $validated['status'] === Enrollment::STATUS_ACTIVE && !isset($validated['ended_at'])) {
            $validated['ended_at'] = null;
        }

        $oldClassId = $enrollment->class_id;
        $enrollment->update($validated);

        $freshEnrollment = $enrollment->fresh(['user', 'class.teacher']);

        $logMsg = "Memperbarui status pendaftaran kelas ID {$enrollment->id} dari {$oldStatus} ke {$freshEnrollment->status}.";
        if (isset($validated['class_id']) && (int)$validated['class_id'] !== (int)$oldClassId) {
            $className = $freshEnrollment->class?->name ?? 'Kelas Baru';
            $logMsg .= " Siswa dipindahkan ke kelas {$className}.";
        }

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Enrollments',
            $logMsg
        );

        // Realtime Event Broadcast
        event(new \App\Events\EnrollmentUpdated($freshEnrollment));

        if ($oldStatus !== $freshEnrollment->status) {
            $className = $freshEnrollment->class?->class_name ?? $freshEnrollment->class?->name ?? 'Kelas';
            \App\Services\RealtimeNotificationService::notifyUser(
                $freshEnrollment->user_id,
                'kelas',
                'Status Pendaftaran Kelas Diperbarui',
                "Status keanggotaan Anda pada kelas {$className} kini menjadi {$freshEnrollment->status}.",
                '/dashboard/schedule'
            );
        }

        return $this->sendResponse(
            new EnrollmentResource($freshEnrollment),
            'Status pendaftaran kelas berhasil diperbarui.'
        );
    }

    /**
     * Cancel an enrollment (Safe non-destructive ending of class assignment).
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $enrollment = Enrollment::find($id);

        if (!$enrollment) {
            return $this->sendError('Data pendaftaran kelas tidak ditemukan.', [], 404);
        }

        $enrollment->update([
            'status'   => Enrollment::STATUS_CANCELLED,
            'ended_at' => now(),
            'notes'    => $enrollment->notes . ' [Dibatalkan oleh Administrator]',
        ]);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CANCEL',
            'Enrollments',
            "Membatalkan pendaftaran kelas ID {$enrollment->id} untuk siswa ID {$enrollment->user_id}."
        );

        $freshEnrollment = $enrollment->fresh(['user', 'class.teacher']);

        // Realtime Event Broadcast
        event(new \App\Events\EnrollmentUpdated($freshEnrollment));

        \App\Services\RealtimeNotificationService::notifyUser(
            $freshEnrollment->user_id,
            'kelas',
            'Pendaftaran Kelas Dibatalkan',
            'Pendaftaran kelas Anda telah dibatalkan oleh Administrator.',
            '/dashboard/schedule'
        );

        return $this->sendResponse(
            new EnrollmentResource($freshEnrollment),
            'Pendaftaran kelas berhasil dibatalkan.'
        );
    }
}
