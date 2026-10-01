<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreRegistrationRequest;
use App\Http\Resources\RegistrationResource;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;

class RegistrationController extends BaseApiController
{
    public function __construct(
        protected RegistrationService $registrationService
    ) {}

    /**
     * Store a new student registration.
     */
    public function store(StoreRegistrationRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $registration = $this->registrationService->createRegistration($validated);

        return $this->sendResponse(
            new RegistrationResource($registration),
            'Pendaftaran Anda berhasil dikirim. Tim konsultan LPK akan segera menghubungi Anda melalui WhatsApp.',
            201
        );
    }
}
