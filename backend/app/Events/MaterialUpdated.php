<?php

namespace App\Events;

use App\Models\Material;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MaterialUpdated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Material $material)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), [
            'class.' . $this->material->class_id,
            'admin',
        ], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('class.' . $this->material->class_id),
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'material.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id'               => $this->material->id,
            'classId'          => $this->material->class_id,
            'className'        => $this->material->class?->class_name ?? $this->material->class?->name,
            'teacherId'        => $this->material->teacher_id,
            'title'            => $this->material->title,
            'description'      => $this->material->description,
            'type'             => $this->material->type,
            'originalFilename' => $this->material->original_filename,
            'fileSize'         => $this->material->file_size,
            'externalUrl'      => $this->material->external_url,
            'isPublished'      => (bool) $this->material->is_published,
            'publishedAt'      => $this->material->published_at?->toISOString(),
            'createdAt'        => $this->material->created_at?->toISOString(),
            'updatedAt'        => $this->material->updated_at?->toISOString(),
        ];
    }
}
