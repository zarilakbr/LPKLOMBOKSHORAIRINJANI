<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'role'        => $this->role,
            'department'  => $this->department,
            'status'      => $this->status,
            'lastLoginAt' => $this->last_login_at?->toISOString(),
            'createdAt'   => $this->created_at?->toISOString(),
        ];
    }
}
