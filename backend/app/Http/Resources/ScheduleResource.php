<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'classId'      => $this->class_id,
            'className'    => $this->class?->class_name ?? $this->class?->name,
            'programTitle' => $this->class?->program?->title,
            'teacherName'  => $this->class?->teacher?->name ?? $this->class?->instructor,
            'title'        => $this->title,
            'date'         => $this->date?->format('Y-m-d'),
            'startTime'    => $this->start_time,
            'endTime'      => $this->end_time,
            'location'     => $this->location ?: ($this->class?->location ?: '-'),
            'status'       => $this->status,
            'notes'        => $this->notes,
            'createdAt'    => $this->created_at?->toISOString(),
            'updatedAt'    => $this->updated_at?->toISOString(),
        ];
    }
}
