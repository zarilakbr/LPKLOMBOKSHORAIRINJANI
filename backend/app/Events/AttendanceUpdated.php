<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceUpdated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Attendance $attendance)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'user.' . $this->attendance->user_id,
            'class.' . $this->attendance->class_id,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->attendance->user_id),
            new PrivateChannel('class.' . $this->attendance->class_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'attendance.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id'             => $this->attendance->id,
            'userId'         => $this->attendance->user_id,
            'classId'        => $this->attendance->class_id,
            'attendanceDate' => $this->attendance->attendance_date?->format('Y-m-d'),
            'status'         => $this->attendance->status,
            'notes'          => $this->attendance->notes,
            'updatedAt'      => $this->attendance->updated_at?->toISOString(),
        ];
    }
}
