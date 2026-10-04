<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClassDeleted implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $classId,
        public ?int $teacherId = null,
        public ?string $className = null
    ) {
        $channels = [
            'admin',
            'class.' . $this->classId,
        ];

        if ($this->teacherId) {
            $channels[] = 'user.' . $this->teacherId;
        }

        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), $channels, $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('admin'),
            new PrivateChannel('class.' . $this->classId),
        ];

        if ($this->teacherId) {
            $channels[] = new PrivateChannel('user.' . $this->teacherId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'class.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => $this->classId,
            'className' => $this->className,
            'teacherId' => $this->teacherId,
            'deletedAt' => now()->toISOString(),
        ];
    }
}
