<?php

namespace App\Events;

use App\Models\Enrollment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EnrollmentUpdated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Enrollment $enrollment)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'user.' . $this->enrollment->user_id,
            'class.' . $this->enrollment->class_id,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->enrollment->user_id),
            new PrivateChannel('class.' . $this->enrollment->class_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'enrollment.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => $this->enrollment->id,
            'userId'    => $this->enrollment->user_id,
            'classId'   => $this->enrollment->class_id,
            'status'    => $this->enrollment->status,
            'endedAt'   => $this->enrollment->ended_at?->toISOString(),
            'notes'     => $this->enrollment->notes,
            'updatedAt' => $this->enrollment->updated_at?->toISOString(),
        ];
    }
}
