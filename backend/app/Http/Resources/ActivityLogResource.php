<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'userId'      => $this->user_id,
            'userName'    => $this->user_name ?? $this->user?->name ?? 'System',
            'action'      => $this->action,
            'module'      => $this->module,
            'description' => $this->description,
            'ipAddress'   => $this->ip_address,
            'createdAt'   => $this->created_at?->toISOString(),
        ];
    }
}
