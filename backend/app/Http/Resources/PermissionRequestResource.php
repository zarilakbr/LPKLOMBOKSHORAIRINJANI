<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'userId'      => $this->user_id,
            'userName'    => $this->user?->name,
            'userEmail'   => $this->user?->email,
            'classId'     => $this->class_id,
            'className'   => $this->class?->name,
            'type'        => $this->type,
            'startDate'   => $this->start_date?->format('Y-m-d'),
            'endDate'     => $this->end_date?->format('Y-m-d'),
            'reason'      => $this->reason,
            'status'      => $this->status,
            'reviewedBy'  => $this->reviewed_by,
            'reviewerName'=> $this->reviewer?->name,
            'reviewedAt'  => $this->reviewed_at?->toISOString(),
            'reviewNotes' => $this->review_notes,
            'attachments' => PermissionAttachmentResource::collection($this->whenLoaded('attachments')),
            'createdAt'   => $this->created_at?->toISOString(),
            'updatedAt'   => $this->updated_at?->toISOString(),
        ];
    }
}
