<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->profile;

        return [
            'id'          => $this->id,
            'name'        => $this->name,
            'email'       => $this->email,
            'phone'       => $this->phone,
            'avatar'      => $this->avatar,
            'role'        => $this->role,
            'department'  => $this->department,
            'status'      => $this->status,
            'lastLoginAt' => $this->last_login_at?->toISOString(),
            'createdAt'   => $this->created_at?->toISOString(),
            'profile'     => $profile ? [
                'fullName'               => $profile->full_name,
                'phone'                  => $profile->phone,
                'gender'                 => $profile->gender,
                'dob'                    => $profile->dob?->format('Y-m-d'),
                'placeOfBirth'           => $profile->place_of_birth,
                'address'                => $profile->address,
                'city'                   => $profile->city,
                'province'               => $profile->province,
                'postalCode'             => $profile->postal_code,
                'educationLevel'         => $profile->education_level,
                'schoolOrUniversity'     => $profile->school_or_university,
                'major'                  => $profile->major,
                'japaneseLevel'          => $profile->japanese_level,
                'japanGoal'              => $profile->japan_goal,
                'bio'                    => $profile->bio,
                'idCardNumber'           => $profile->id_card_number,
                'emergencyContactName'   => $profile->emergency_contact_name,
                'emergencyContactPhone'  => $profile->emergency_contact_phone,
            ] : null,
        ];
    }
}
