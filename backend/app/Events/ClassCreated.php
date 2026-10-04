<?php

namespace App\Events;

use App\Models\ProgramClass;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClassCreated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ProgramClass $class)
    {
        $channels = [
            'admin',
            'class.' . $this->class->id,
        ];

        if ($this->class->teacher_id) {
            $channels[] = 'user.' . $this->class->teacher_id;
        }

        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), $channels, $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('admin'),
            new PrivateChannel('class.' . $this->class->id),
        ];

        if ($this->class->teacher_id) {
            $channels[] = new PrivateChannel('user.' . $this->class->teacher_id);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'class.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'              => $this->class->id,
            'className'       => $this->class->class_name ?? $this->class->name,
            'name'            => $this->class->name ?? $this->class->class_name,
            'programId'       => $this->class->program_id,
            'programTitle'    => $this->class->program?->title ?? 'Program Pelatihan',
            'teacherId'       => $this->class->teacher_id,
            'instructor'      => $this->class->teacher?->name ?? $this->class->instructor,
            'teacher'         => $this->class->teacher ? [
                'id'    => $this->class->teacher->id,
                'name'  => $this->class->teacher->name,
                'email' => $this->class->teacher->email,
            ] : null,
            'level'           => $this->class->level,
            'schedule'        => $this->class->schedule,
            'startDate'       => $this->class->start_date?->format('Y-m-d'),
            'endDate'         => $this->class->end_date?->format('Y-m-d'),
            'capacity'        => $this->class->capacity,
            'currentStudents' => $this->class->current_students ?? 0,
            'location'        => $this->class->location,
            'status'          => $this->class->status,
            'description'     => $this->class->description,
            'createdAt'       => $this->class->created_at?->toISOString(),
            'updatedAt'       => $this->class->updated_at?->toISOString(),
        ];
    }
}
