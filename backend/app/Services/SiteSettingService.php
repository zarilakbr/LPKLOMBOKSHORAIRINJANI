<?php

namespace App\Services;

use App\Models\SiteSetting;
use App\Models\User;

class SiteSettingService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function getAll(): array
    {
        $settings = SiteSetting::all();
        $formatted = [];

        foreach ($settings as $setting) {
            $formatted[$setting->key] = $setting->value;
        }

        return $formatted;
    }

    public function updateBulk(array $settings, ?User $actor = null): void
    {
        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        if ($actor) {
            $this->activityLogService->log(
                $actor->id,
                $actor->name,
                'UPDATE',
                'Settings',
                "Memperbarui pengaturan platform."
            );
        }
    }
}
