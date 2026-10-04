<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'avatar'          => $this->avatar,
            'role'            => $this->role,
            'department'      => $this->department,
            'status'          => $this->status,
            'emailVerifiedAt' => $this->email_verified_at?->toISOString(),
            'approvedAt'      => $this->approved_at?->toISOString(),
            'approvedBy'      => $this->approved_by,
            'rejectedAt'      => $this->rejected_at?->toISOString(),
            'rejectionReason' => $this->rejection_reason,
            'lastLoginAt'     => $this->last_login_at?->toISOString(),
            'createdAt'       => $this->created_at?->toISOString(),
        ];
    }
}
