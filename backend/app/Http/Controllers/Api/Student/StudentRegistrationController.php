<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\RegistrationResource;
use App\Models\Registration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentRegistrationController extends BaseApiController
{
    /**
     * Get all registrations submitted by the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $registrations = Registration::where('user_id', $userId)
            ->with('program')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return $this->sendPaginated(
            $registrations->through(fn ($reg) => new RegistrationResource($reg)),
            'Daftar pendaftaran Anda berhasil dimuat.'
        );
    }

    /**
     * Get detail of a specific registration owned by the authenticated student.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $registration = Registration::with('program')->find($id);

        if (!$registration) {
            return $this->sendError('Data pendaftaran tidak ditemukan.', [], 404);
        }

        // Strict Resource-Level Ownership Check (IDOR Protection)
        if ($registration->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk melihat pendaftaran ini.', [], 403);
        }

        return $this->sendResponse(
            new RegistrationResource($registration),
            'Detail pendaftaran berhasil dimuat.'
        );
    }
}
