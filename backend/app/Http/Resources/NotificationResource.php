<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'userId'    => $this->user_id,
            'type'      => $this->type,
            'title'     => $this->title,
            'message'   => $this->message,
            'isRead'    => (bool) $this->is_read,
            'readAt'    => $this->read_at?->toISOString(),
            'link'      => $this->link,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
