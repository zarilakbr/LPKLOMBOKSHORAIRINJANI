<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Notification $notification)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'user.' . $this->notification->user_id,
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->notification->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => $this->notification->id,
            'userId'    => $this->notification->user_id,
            'type'      => $this->notification->type,
            'title'     => $this->notification->title,
            'message'   => $this->notification->message,
            'link'      => $this->notification->link,
            'isRead'    => (bool) $this->notification->is_read,
            'createdAt' => $this->notification->created_at?->toISOString(),
        ];
    }
}
