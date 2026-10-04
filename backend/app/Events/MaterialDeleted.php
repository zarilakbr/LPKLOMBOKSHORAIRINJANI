<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MaterialDeleted implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $materialId,
        public int $classId,
        public ?string $title = null,
        public ?string $deletedAt = null
    ) {
        $this->deletedAt = $this->deletedAt ?: now()->toISOString();

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
        return 'material.deleted';
    }

    public function broadcastWith(): array
    {
        return [
            'id'        => $this->materialId,
            'classId'   => $this->classId,
            'title'     => $this->title,
            'deletedAt' => $this->deletedAt,
        ];
    }
}
