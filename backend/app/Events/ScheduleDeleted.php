<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleDeleted implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $scheduleId,
        public int $classId,
        public ?string $title = null
    ) {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'class.' . $this->classId,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('class.' . $this->classId),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'schedule.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => $this->scheduleId,
            'classId'   => $this->classId,
            'title'     => $this->title,
            'deletedAt' => now()->toISOString(),
        ];
    }
}
