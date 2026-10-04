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
            'className'       => $this->class_name ?? $this->name,
            'programId'       => $this->program_id,
            'programTitle'    => $this->program?->title ?? 'Program Umum',
            'teacherId'       => $this->teacher_id,
            'teacher'         => $this->teacher ? [
                'id'    => $this->teacher->id,
                'name'  => $this->teacher->name,
                'email' => $this->teacher->email,
            ] : null,
            'instructor'      => $this->teacher?->name ?? $this->instructor,
            'level'           => $this->level,
            'schedule'        => $this->schedule,
            'startDate'       => $this->start_date?->format('Y-m-d'),
            'endDate'         => $this->end_date?->format('Y-m-d'),
            'capacity'        => $this->capacity,
            'currentStudents' => $this->current_students,
            'location'        => $this->location,
            'status'          => $this->status,
            'description'     => $this->description,
        ];
    }
}
