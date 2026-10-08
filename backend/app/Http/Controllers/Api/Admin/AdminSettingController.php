<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\UpdateSettingsRequest;
use App\Services\SiteSettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingController extends BaseApiController
{
    public function __construct(
        protected SiteSettingService $settingService
    ) {}

    public function index(): JsonResponse
    {
        $settings = $this->settingService->getAll();

        return $this->sendResponse(
            $settings,
            'Pengaturan platform berhasil dimuat.'
        );
    }

    public function publicSettings(): JsonResponse
    {
        $settings = $this->settingService->getAll();

        return $this->sendResponse(
            $settings,
            'Pengaturan publik lembaga berhasil dimuat.'
        );
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $this->settingService->updateBulk($request->validated(), $request->user());

        return $this->sendResponse(
            $this->settingService->getAll(),
            'Pengaturan platform berhasil disimpan.'
        );
    }
}
