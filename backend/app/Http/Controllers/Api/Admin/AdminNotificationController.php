<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\RealtimeNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminNotificationController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Get admin notifications list and unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $scope = $request->input('scope', 'my'); // 'my' | 'all'

        $query = Notification::query()->with('user:id,name,email,role');

        if ($scope !== 'all' && !$request->filled('user_id')) {
            $query->where('user_id', $userId);
        } elseif ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('is_read') && $request->is_read !== 'ALL') {
            $isRead = filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_read', $isRead);
        }

        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', $request->type);
        }

        $unreadCount = Notification::where('user_id', $userId)->where('is_read', false)->count();

        $notifications = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success'     => true,
            'message'     => 'Notifikasi admin berhasil dimuat.',
            'unreadCount' => $unreadCount,
            'data'        => NotificationResource::collection($notifications->items()),
            'meta'        => [
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
                'per_page'     => $notifications->perPage(),
                'total'        => $notifications->total(),
            ]
        ], 200);
    }

    /**
     * Broadcast a new notification to a specific user, role group, or all active users.
     */
    public function store(Request $request): JsonResponse
    {
        $input = $request->all();
        if (!isset($input['role']) && isset($input['target_role'])) {
            $input['role'] = $input['target_role'];
        }

        $validator = Validator::make($input, [
            'target_type' => ['required', 'string', 'in:all,role,user'],
            'role'        => ['required_if:target_type,role', 'nullable', 'string', 'in:SISWA,PENGAJAR'],
            'user_id'     => ['required_if:target_type,user', 'nullable', 'integer', 'exists:users,id'],
            'type'        => ['nullable', 'string', 'max:50'],
            'title'       => ['required', 'string', 'max:255'],
            'message'     => ['required', 'string', 'max:2000'],
            'link'        => ['nullable', 'string', 'max:255'],
        ], [
            'target_type.required' => 'Target penerima notifikasi wajib dipilih.',
            'title.required'       => 'Judul notifikasi wajib diisi.',
            'message.required'     => 'Isi pesan notifikasi wajib diisi.',
            'role.in'              => 'Peran target harus SISWA atau PENGAJAR.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi pengiriman notifikasi gagal.', $validator->errors(), 422);
        }

        $targetType = $input['target_type'];
        $type = $input['type'] ?? 'pengumuman';
        $title = trim($input['title']);
        $message = trim($input['message']);
        $link = $input['link'] ?? null;

        $targetUserIds = [];

        if ($targetType === 'user') {
            $targetUserIds = [$input['user_id']];
        } elseif ($targetType === 'role') {
            $targetUserIds = User::where('role', $input['role'])
                ->where('status', User::STATUS_ACTIVE)
                ->pluck('id')
                ->toArray();
        } else { // 'all'
            $targetUserIds = User::where('status', User::STATUS_ACTIVE)
                ->pluck('id')
                ->toArray();
        }

        $createdCount = 0;
        foreach ($targetUserIds as $uId) {
            RealtimeNotificationService::notifyUser($uId, $type, $title, $message, $link);
            $createdCount++;
        }

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'BROADCAST_NOTIFICATION',
            'Notifications',
            "Mengirim notifikasi '{$title}' kepada {$createdCount} pengguna (Target: {$targetType})."
        );

        return $this->sendResponse([
            'deliveredCount' => $createdCount,
            'targetType'     => $targetType,
        ], "Notifikasi berhasil disiarkan kepada {$createdCount} pengguna.", 201);
    }

    /**
     * Mark a single notification as read.
     */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;
        $notification = Notification::find($id);

        if (!$notification) {
            return $this->sendError('Notifikasi tidak ditemukan.', [], 404);
        }

        if ($notification->user_id !== $userId && !$request->user()->isAdmin()) {
            return $this->sendError('Akses ditolak.', [], 403);
        }

        if (!$notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return $this->sendResponse(new NotificationResource($notification), 'Notifikasi berhasil ditandai telah dibaca.');
    }

    /**
     * Mark all unread notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $updatedCount = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return $this->sendResponse([
            'markedCount' => $updatedCount
        ], 'Seluruh notifikasi berhasil ditandai telah dibaca.');
    }

    /**
     * Delete a notification by Admin.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return $this->sendError('Notifikasi tidak ditemukan.', [], 404);
        }

        $title = $notification->title;
        $notification->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE_NOTIFICATION',
            'Notifications',
            "Menghapus notifikasi ID #{$id} ('{$title}')."
        );

        return $this->sendResponse(null, 'Notifikasi berhasil dihapus.');
    }
}
