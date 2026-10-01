<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'className'       => $this->class_name,
            'programId'       => $this->program_id,
            'programTitle'    => $this->program?->title ?? 'Program Umum',
            'instructor'      => $this->instructor,
            'level'           => $this->level,
            'schedule'        => $this->schedule,
            'startDate'       => $this->start_date?->format('Y-m-d'),
            'endDate'         => $this->end_date?->format('Y-m-d'),
            'capacity'        => $this->capacity,
            'currentStudents' => $this->current_students,
            'location'        => $this->location,
            'status'          => $this->status,
        ];
    }
}
