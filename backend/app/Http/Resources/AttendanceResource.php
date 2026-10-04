<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'userId'         => $this->user_id,
            'userName'       => $this->user?->name,
            'userEmail'      => $this->user?->email,
            'classId'        => $this->class_id,
            'className'      => $this->class?->name,
            'attendanceDate' => $this->attendance_date?->format('Y-m-d'),
            'checkInAt'      => $this->check_in_at?->format('Y-m-d H:i:s'),
            'status'         => $this->status,
            'notes'          => $this->notes,
            'createdAt'      => $this->created_at?->toISOString(),
            'updatedAt'      => $this->updated_at?->toISOString(),
        ];
    }
}
