<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\ProgramClass;
use App\Models\User;

class RealtimeNotificationService
{
    /**
     * Create a persisted notification for a specific user and broadcast it realtime.
     */
    public static function notifyUser(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): Notification {
        $notification = Notification::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'link'    => $link,
            'is_read' => false,
        ]);

        // Broadcast to user's private channel
        event(new NotificationCreated($notification));

        return $notification;
    }

    /**
     * Create persisted notifications for all ADMIN users and broadcast realtime.
     */
    public static function notifyAdmins(
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): array {
        $adminIds = User::where('role', User::ROLE_ADMIN)->pluck('id');
        $notifications = [];

        foreach ($adminIds as $adminId) {
            $notifications[] = self::notifyUser($adminId, $type, $title, $message, $link);
        }

        return $notifications;
    }

    /**
     * Create persisted notification for the teacher assigned to a class and broadcast realtime.
     */
    public static function notifyClassTeacher(
        int $classId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): ?Notification {
        $class = ProgramClass::find($classId);
        if (!$class || !$class->teacher_id) {
            return null;
        }

        return self::notifyUser($class->teacher_id, $type, $title, $message, $link);
    }

    /**
     * Create persisted notifications for all active enrolled students in a class.
     */
    public static function notifyClassStudents(
        int $classId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): array {
        $studentIds = Enrollment::where('class_id', $classId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->pluck('user_id');

        $notifications = [];
        foreach ($studentIds as $studentId) {
            $notifications[] = self::notifyUser($studentId, $type, $title, $message, $link);
        }

        return $notifications;
    }
}
