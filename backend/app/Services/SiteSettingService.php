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

        // Convenience aliases for frontend compatibility
        $instName = $formatted['institutionName'] ?? ($formatted['organization_name'] ?? ($formatted['brand_name'] ?? 'LPK Lombok Shorai Rinjani'));
        $formatted['institutionName'] = $instName;
        $formatted['organization_name'] = $instName;

        $jpName = $formatted['japaneseName'] ?? ($formatted['japanese_name'] ?? 'ロンボク将来リンジャニ日本語教育学校');
        $formatted['japaneseName'] = $jpName;
        $formatted['japanese_name'] = $jpName;

        $waRaw = $formatted['whatsapp'] ?? '+81 80-7507-9228';
        $waDigits = preg_replace('/[^0-9]/', '', (string)$waRaw);
        $formatted['whatsapp'] = $waRaw;
        $formatted['whatsappDigits'] = $waDigits;
        $formatted['whatsappUrl'] = 'https://wa.me/' . $waDigits . '?text=' . urlencode('Halo Admin LPK Lombok Shorai Rinjani, saya ingin berkonsultasi mengenai program pelatihan dan karier ke Jepang.');

        $mapsUrl = $formatted['googleMapsUrl'] ?? ($formatted['maps_url'] ?? 'https://maps.google.com/?q=Jl.+Raya+Abdul+Aziz.99+Parwa,+Dusun+Parwa,+Dasan+Tapen,+Kec.+Gerung,+Kab.+Lombok+Barat,+NTB+83363');
        $formatted['googleMapsUrl'] = $mapsUrl;
        $formatted['maps_url'] = $mapsUrl;

        $operatingHours = $formatted['operatingHours'] ?? ($formatted['operating_hours'] ?? 'Senin – Sabtu: 08.00 – 17.00 WITA');
        $formatted['operatingHours'] = $operatingHours;
        $formatted['operating_hours'] = $operatingHours;

        return $formatted;
    }

    public function updateBulk(array $settings, ?User $actor = null): void
    {
        $syncPairs = [
            'institutionName' => 'organization_name',
            'organization_name' => 'institutionName',
            'japaneseName' => 'japanese_name',
            'japanese_name' => 'japaneseName',
            'googleMapsUrl' => 'maps_url',
            'mapsUrl' => 'maps_url',
            'maps_url' => 'googleMapsUrl',
            'operatingHours' => 'operating_hours',
            'operating_hours' => 'operatingHours',
        ];

        foreach ($settings as $key => $value) {
            SiteSetting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );

            if (isset($syncPairs[$key])) {
                SiteSetting::updateOrCreate(
                    ['key' => $syncPairs[$key]],
                    ['value' => $value]
                );
            }
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
