<?php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceRecorded implements ShouldBroadcastNow, ShouldRescue
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
        return 'attendance.recorded';
    }

    public function broadcastWith(): array
    {
        return [
            'id'             => $this->attendance->id,
            'userId'         => $this->attendance->user_id,
            'userName'       => $this->attendance->user?->name,
            'classId'        => $this->attendance->class_id,
            'className'      => $this->attendance->class?->class_name ?? $this->attendance->class?->name,
            'attendanceDate' => $this->attendance->attendance_date?->format('Y-m-d'),
            'status'         => $this->attendance->status,
            'checkInAt'      => $this->attendance->check_in_at?->toISOString(),
            'notes'          => $this->attendance->notes,
        ];
    }
}
