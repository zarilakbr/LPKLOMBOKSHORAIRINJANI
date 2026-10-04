<?php

namespace App\Events;

use App\Models\ProgramClass;
use App\Models\Schedule;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleUpdated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ProgramClass|Schedule $target)
    {
        $classId = $this->target instanceof Schedule ? $this->target->class_id : $this->target->id;

        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'class.' . $classId,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        $classId = $this->target instanceof Schedule ? $this->target->class_id : $this->target->id;

        return [
            new PrivateChannel('class.' . $classId),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'schedule.updated';
    }

    public function broadcastWith(): array
    {
        if ($this->target instanceof Schedule) {
            return [
                'id'           => $this->target->id,
                'classId'      => $this->target->class_id,
                'className'    => $this->target->class?->class_name ?? $this->target->class?->name,
                'programTitle' => $this->target->class?->program?->title,
                'title'        => $this->target->title,
                'date'         => $this->target->date?->format('Y-m-d'),
                'startTime'    => $this->target->start_time,
                'endTime'      => $this->target->end_time,
                'location'     => $this->target->location,
                'status'       => $this->target->status,
                'notes'        => $this->target->notes,
                'updatedAt'    => $this->target->updated_at?->toISOString(),
            ];
        }

        // ProgramClass fallback for backward compatibility
        return [
            'classId'      => $this->target->id,
            'className'    => $this->target->class_name ?? $this->target->name,
            'programTitle' => $this->target->program?->title,
            'schedule'     => $this->target->schedule,
            'location'     => $this->target->location,
            'startDate'    => $this->target->start_date?->format('Y-m-d'),
            'endDate'      => $this->target->end_date?->format('Y-m-d'),
            'status'       => $this->target->status,
        ];
    }
}
