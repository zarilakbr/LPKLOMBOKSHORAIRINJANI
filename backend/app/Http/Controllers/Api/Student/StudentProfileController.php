<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Student\UpdateStudentProfileRequest;
use App\Http\Resources\StudentProfileResource;
use App\Models\UserProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentProfileController extends BaseApiController
{
    /**
     * Get the authenticated student's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        return $this->sendResponse(
            new StudentProfileResource($user),
            'Data profil siswa berhasil dimuat.'
        );
    }

    /**
     * Update the authenticated student's profile.
     */
    public function update(UpdateStudentProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        // 1. Update basic user fields
        $userFields = array_intersect_key($validated, array_flip(['name', 'phone', 'avatar']));
        if (!empty($userFields)) {
            $user->update($userFields);
        }

        // 2. Update or create user profile details
        $profileKeys = [
            'full_name', 'gender', 'dob', 'place_of_birth', 'address', 'city', 'province',
            'postal_code', 'education_level', 'school_or_university', 'major', 'japanese_level',
            'japan_goal', 'bio', 'id_card_number', 'emergency_contact_name', 'emergency_contact_phone'
        ];
        $profileData = array_intersect_key($validated, array_flip($profileKeys));

        if (!empty($profileData)) {
            UserProfile::updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        return $this->sendResponse(
            new StudentProfileResource($user->fresh('profile')),
            'Profil siswa berhasil diperbarui.'
        );
    }
}
