<?php

namespace App\Services;

use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class RealtimeEventBus
{
    private const CACHE_KEY = 'lms_recent_realtime_events';
    private const MAX_EVENTS = 100;
    private const TTL_SECONDS = 900; // 15 minutes

    /**
     * Emit a realtime event into the authorized event buffer.
     *
     * @param string $eventName Event identifier (e.g. 'attendance.recorded')
     * @param array $channels Array of channel names (e.g. ['user.12', 'class.1'])
     * @param array $payload Sanitized event data
     */
    public static function emit(string $eventName, array $channels, array $payload): array
    {
        $eventRecord = [
            'id'        => (string) Str::uuid(),
            'event'     => $eventName,
            'channels'  => array_values($channels),
            'data'      => $payload,
            'timestamp' => microtime(true),
            'createdAt' => now()->toISOString(),
        ];

        try {
            $events = Cache::get(self::CACHE_KEY, []);
            if (!is_array($events)) {
                $events = [];
            }

            $events[] = $eventRecord;

            // Maintain rolling buffer of last MAX_EVENTS
            if (count($events) > self::MAX_EVENTS) {
                $events = array_slice($events, -self::MAX_EVENTS);
            }

            Cache::put(self::CACHE_KEY, $events, self::TTL_SECONDS);
        } catch (\Throwable $e) {
            // Fail safe without breaking database transactions
        }

        return $eventRecord;
    }

    /**
     * Get list of authorized channels for a specific user.
     */
    public static function getAuthorizedChannelsForUser(User $user): array
    {
        $channels = [
            'user.' . $user->id,
        ];

        if ($user->role === User::ROLE_ADMIN) {
            $channels[] = 'admin';
            // Admin can monitor all active classes
            $allClassIds = ProgramClass::pluck('id');
            foreach ($allClassIds as $cId) {
                $channels[] = 'class.' . $cId;
            }
        } elseif ($user->role === User::ROLE_PENGAJAR) {
            // Teacher can monitor classes they are assigned to
            $teacherClassIds = ProgramClass::where('teacher_id', $user->id)->pluck('id');
            foreach ($teacherClassIds as $cId) {
                $channels[] = 'class.' . $cId;
            }
        } elseif ($user->role === User::ROLE_SISWA) {
            // Student can ONLY monitor classes where they have an ACTIVE enrollment
            $studentClassIds = Enrollment::where('user_id', $user->id)
                ->where('status', Enrollment::STATUS_ACTIVE)
                ->pluck('class_id');
            foreach ($studentClassIds as $cId) {
                $channels[] = 'class.' . $cId;
            }
        }

        return array_unique($channels);
    }

    /**
     * Check if a user is authorized to subscribe to a specific channel.
     */
    public static function isUserAuthorizedForChannel(User $user, string $channel): bool
    {
        // Private channel prefix handling
        $cleanChannel = str_starts_with($channel, 'private-')
            ? substr($channel, 8)
            : $channel;

        if ($cleanChannel === 'admin') {
            return $user->role === User::ROLE_ADMIN;
        }

        if (str_starts_with($cleanChannel, 'user.')) {
            $targetUserId = (int) substr($cleanChannel, 5);
            return (int) $user->id === $targetUserId;
        }

        if (str_starts_with($cleanChannel, 'class.')) {
            $classId = (int) substr($cleanChannel, 6);

            if ($user->role === User::ROLE_ADMIN) {
                return true;
            }

            if ($user->role === User::ROLE_PENGAJAR) {
                return ProgramClass::where('id', $classId)
                    ->where('teacher_id', $user->id)
                    ->exists();
            }

            if ($user->role === User::ROLE_SISWA) {
                return Enrollment::where('user_id', $user->id)
                    ->where('class_id', $classId)
                    ->where('status', Enrollment::STATUS_ACTIVE)
                    ->exists();
            }
        }

        return false;
    }

    /**
     * Retrieve events that match the user's authorized channels since a given timestamp.
     */
    public static function getEventsForUser(User $user, ?float $since = null): array
    {
        $authorizedChannels = self::getAuthorizedChannelsForUser($user);
        $allEvents = Cache::get(self::CACHE_KEY, []);

        if (!is_array($allEvents) || empty($allEvents)) {
            return [];
        }

        $filtered = [];
        foreach ($allEvents as $ev) {
            // Filter by timestamp if provided
            if ($since !== null && ($ev['timestamp'] ?? 0) <= $since) {
                continue;
            }

            // Check if any event channel intersects with user's authorized channels
            $eventChannels = $ev['channels'] ?? [];
            $hasAccess = false;
            foreach ($eventChannels as $ch) {
                if (in_array($ch, $authorizedChannels, true)) {
                    $hasAccess = true;
                    break;
                }
            }

            if ($hasAccess) {
                $filtered[] = $ev;
            }
        }

        return $filtered;
    }
}
