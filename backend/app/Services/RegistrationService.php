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
        $registration = Registration::create($data);

        // Realtime Event & Admin Notification
        event(new \App\Events\RegistrationCreated($registration->load(['user', 'program'])));
        RealtimeNotificationService::notifyAdmins(
            'pendaftaran',
            'Pendaftaran Baru Masuk',
            "Pendaftaran baru atas nama {$registration->full_name} untuk program {$registration->program?->title}.",
            '/admin/registrations'
        );

        return $registration;
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
