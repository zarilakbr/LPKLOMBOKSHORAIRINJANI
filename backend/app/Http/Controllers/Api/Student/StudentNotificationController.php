<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentNotificationController extends BaseApiController
{
    /**
     * Get student's notifications list and unread count.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = Notification::where('user_id', $userId);

        if ($request->has('is_read') && $request->is_read !== 'ALL') {
            $isRead = filter_var($request->is_read, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_read', $isRead);
        }

        $unreadCount = Notification::where('user_id', $userId)->where('is_read', false)->count();

        $notifications = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'success'     => true,
            'message'     => 'Notifikasi siswa berhasil dimuat.',
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
     * Get a specific notification detail.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $notification = Notification::find($id);

        if (!$notification) {
            return $this->sendError('Notifikasi tidak ditemukan.', [], 404);
        }

        // Strict IDOR Check
        if ($notification->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk melihat notifikasi ini.', [], 403);
        }

        return $this->sendResponse(new NotificationResource($notification), 'Detail notifikasi berhasil dimuat.');
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

        // Strict IDOR Check
        if ($notification->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak dapat menandai notifikasi ini.', [], 403);
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
}
