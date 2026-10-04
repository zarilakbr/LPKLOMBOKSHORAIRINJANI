<?php

namespace App\Events;

use App\Models\Schedule;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleCreated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Schedule $schedule)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'class.' . $this->schedule->class_id,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('class.' . $this->schedule->class_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'schedule.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'           => $this->schedule->id,
            'classId'      => $this->schedule->class_id,
            'className'    => $this->schedule->class?->class_name ?? $this->schedule->class?->name,
            'programTitle' => $this->schedule->class?->program?->title,
            'title'        => $this->schedule->title,
            'date'         => $this->schedule->date?->format('Y-m-d'),
            'startTime'    => $this->schedule->start_time,
            'endTime'      => $this->schedule->end_time,
            'location'     => $this->schedule->location,
            'status'       => $this->schedule->status,
            'notes'        => $this->schedule->notes,
            'createdAt'    => $this->schedule->created_at?->toISOString(),
            'updatedAt'    => $this->schedule->updated_at?->toISOString(),
        ];
    }
}
