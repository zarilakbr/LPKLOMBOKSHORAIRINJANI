<?php

namespace App\Events;

use App\Models\PermissionRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermissionCreated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public PermissionRequest $permission)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'class.' . $this->permission->class_id,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('class.' . $this->permission->class_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'permission.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->permission->id,
            'userId'      => $this->permission->user_id,
            'userName'    => $this->permission->user?->name,
            'classId'     => $this->permission->class_id,
            'className'   => $this->permission->class?->class_name ?? $this->permission->class?->name,
            'type'        => $this->permission->type,
            'startDate'   => $this->permission->start_date?->format('Y-m-d'),
            'endDate'     => $this->permission->end_date?->format('Y-m-d'),
            'reason'      => $this->permission->reason,
            'status'      => $this->permission->status,
            'submittedAt' => $this->permission->created_at?->toISOString(),
        ];
    }
}
