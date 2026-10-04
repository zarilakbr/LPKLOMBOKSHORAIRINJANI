<?php

namespace App\Events;

use App\Models\PermissionRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PermissionReviewed implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public PermissionRequest $permission)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'user.' . $this->permission->user_id,
            'class.' . $this->permission->class_id,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->permission->user_id),
            new PrivateChannel('class.' . $this->permission->class_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'permission.reviewed';
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->permission->id,
            'userId'      => $this->permission->user_id,
            'classId'     => $this->permission->class_id,
            'className'   => $this->permission->class?->class_name ?? $this->permission->class?->name,
            'type'        => $this->permission->type,
            'status'      => $this->permission->status,
            'reviewNotes' => $this->permission->review_notes,
            'reviewedBy'  => $this->permission->reviewer?->name,
            'reviewedAt'  => $this->permission->reviewed_at?->toISOString(),
        ];
    }
}
