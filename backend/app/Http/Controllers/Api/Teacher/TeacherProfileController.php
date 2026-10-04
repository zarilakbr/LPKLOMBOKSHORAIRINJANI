<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Teacher\UpdateTeacherProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherProfileController extends BaseApiController
{
    /**
     * Get the authenticated teacher's profile.
     */
    public function show(Request $request): JsonResponse
    {
        return $this->sendResponse(
            new UserResource($request->user()),
            'Data profil pengajar berhasil dimuat.'
        );
    }

    /**
     * Update the authenticated teacher's profile.
     */
    public function update(UpdateTeacherProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if (!empty($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }
        unset($validated['current_password']);

        $user->update($validated);

        return $this->sendResponse(
            new UserResource($user->fresh()),
            'Profil pengajar berhasil diperbarui.'
        );
    }
}
