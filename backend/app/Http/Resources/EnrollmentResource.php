<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'userId'     => $this->user_id,
            'user'       => $this->whenLoaded('user', fn () => [
                'id'     => $this->user->id,
                'name'   => $this->user->name,
                'email'  => $this->user->email,
                'phone'  => $this->user->phone,
                'avatar' => $this->user->avatar,
                'role'   => $this->user->role,
            ]),
            'classId'    => $this->class_id,
            'class'      => $this->whenLoaded('class', fn () => [
                'id'        => $this->class->id,
                'className' => $this->class->class_name ?? $this->class->name,
                'level'     => $this->class->level,
                'schedule'  => $this->class->schedule,
                'status'    => $this->class->status,
                'location'  => $this->class->location,
                'teacher'   => $this->class->teacher ? [
                    'id'    => $this->class->teacher->id,
                    'name'  => $this->class->teacher->name,
                ] : null,
            ]),
            'status'     => $this->status,
            'enrolledAt' => $this->enrolled_at?->toISOString(),
            'endedAt'    => $this->ended_at?->toISOString(),
            'notes'      => $this->notes,
            'createdAt'  => $this->created_at?->toISOString(),
            'updatedAt'  => $this->updated_at?->toISOString(),
        ];
    }
}
