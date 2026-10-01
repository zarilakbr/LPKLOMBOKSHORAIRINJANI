<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\UpdateRegistrationStatusRequest;
use App\Http\Resources\RegistrationResource;
use App\Models\Registration;
use App\Services\ActivityLogService;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRegistrationController extends BaseApiController
{
    public function __construct(
        protected RegistrationService $registrationService,
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Registration::with('program');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('registration_code', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        $registrations = $query->orderBy('created_at', 'desc')->paginate(15);

        return $this->sendPaginated($registrations, 'Data pendaftaran siswa berhasil dimuat.');
    }

    public function show(int $id): JsonResponse
    {
        $registration = Registration::with('program')->find($id);

        if (!$registration) {
            return $this->sendError('Data pendaftaran tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new RegistrationResource($registration),
            'Detail pendaftaran siswa berhasil dimuat.'
        );
    }

    public function update(UpdateRegistrationStatusRequest $request, int $id): JsonResponse
    {
        $registration = Registration::find($id);

        if (!$registration) {
            return $this->sendError('Data pendaftaran tidak ditemukan.', [], 404);
        }

        $validated = $request->validated();
        $updated = $this->registrationService->updateStatus(
            $registration,
            $validated['status'],
            $validated['admin_notes'] ?? null,
            $request->user()
        );

        return $this->sendResponse(
            new RegistrationResource($updated),
            'Status pendaftaran berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $registration = Registration::find($id);

        if (!$registration) {
            return $this->sendError('Data pendaftaran tidak ditemukan.', [], 404);
        }

        $code = $registration->registration_code;
        $name = $registration->full_name;
        $registration->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Registrations',
            "Menghapus pendaftaran {$code} atas nama {$name}."
        );

        return $this->sendResponse(null, 'Data pendaftaran berhasil dihapus.');
    }
}
