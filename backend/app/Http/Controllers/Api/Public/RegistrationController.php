<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreRegistrationRequest;
use App\Http\Resources\RegistrationResource;
use App\Services\RegistrationService;
use App\Services\TurnstileService;
use Illuminate\Http\JsonResponse;

class RegistrationController extends BaseApiController
{
    public function __construct(
        protected RegistrationService $registrationService,
        protected TurnstileService $turnstileService
    ) {}

    /**
     * Store a new student registration.
     */
    public function store(StoreRegistrationRequest $request): JsonResponse
    {
        if ($request->filled('turnstile_token')) {
            if (!$this->turnstileService->verify($request->input('turnstile_token'), $request->ip())) {
                return $this->sendError('Verifikasi keamanan Turnstile gagal. Silakan coba lagi.', [
                    'turnstile' => ['Verifikasi keamanan Turnstile tidak valid atau kedaluwarsa.']
                ], 422);
            }
        }

        $validated = $request->validated();

        $registration = $this->registrationService->createRegistration($validated);

        return $this->sendResponse(
            new RegistrationResource($registration),
            'Pendaftaran Anda berhasil dikirim. Tim konsultan LPK akan segera menghubungi Anda melalui WhatsApp.',
            201
        );
    }
}
