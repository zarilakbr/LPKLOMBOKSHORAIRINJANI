<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'registrationCode' => $this->registration_code,
            'programId'        => $this->program_id,
            'programTitle'     => $this->program?->title ?? $this->program_interest,
            'fullName'         => $this->full_name,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'dob'              => $this->dob?->format('Y-m-d'),
            'education'        => $this->education,
            'city'             => $this->city,
            'programInterest'  => $this->program_interest,
            'japaneseLevel'    => $this->japanese_level,
            'japanGoal'        => $this->japan_goal,
            'message'          => $this->message,
            'status'           => $this->status,
            'adminNotes'       => $this->admin_notes,
            'createdAt'        => $this->created_at?->toISOString(),
            'updatedAt'        => $this->updated_at?->toISOString(),
        ];
    }
}
