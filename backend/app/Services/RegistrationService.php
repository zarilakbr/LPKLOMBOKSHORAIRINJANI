<?php

namespace App\Services;

use App\Models\Registration;
use App\Models\User;

class RegistrationService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Store new student registration from public application form.
     */
    public function createRegistration(array $data): Registration
    {
        return Registration::create($data);
    }

    /**
     * Update student registration status and admin notes.
     */
    public function updateStatus(
        Registration $registration,
        string $status,
        ?string $notes = null,
        ?User $actor = null
    ): Registration {
        $oldStatus = $registration->status;

        $updateData = ['status' => $status];
        if ($notes !== null) {
            $updateData['admin_notes'] = $notes;
        }

        $registration->update($updateData);

        if ($actor) {
            $this->activityLogService->log(
                $actor->id,
                $actor->name,
                'STATUS_CHANGE',
                'Registrations',
                "Mengubah status pendaftaran {$registration->registration_code} ({$registration->full_name}) dari {$oldStatus} menjadi {$status}."
            );
        }

        return $registration;
    }
}
