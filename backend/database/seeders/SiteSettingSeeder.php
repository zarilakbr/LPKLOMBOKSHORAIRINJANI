<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'brand_name',
                'value' => 'LPK Lombok Shorai Rinjani',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Official institution brand name',
            ],
            [
                'key' => 'organization_name',
                'value' => 'LPK Lombok Shorai Rinjani',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Official institution organization display name',
            ],
            [
                'key' => 'short_name',
                'value' => 'Lombok Shorai Rinjani',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Compact brand display name',
            ],
            [
                'key' => 'default_theme',
                'value' => 'light',
                'group' => 'appearance',
                'type' => 'string',
                'description' => 'Default system theme mode',
            ],
            [
                'key' => 'tagline',
                'value' => 'Membuka Gerbang Karier dan Masa Depan di Jepang',
                'group' => 'general',
                'type' => 'string',
                'description' => 'Brand institutional motto and tagline',
            ],
            [
                'key' => 'description',
                'value' => 'Lembaga Pelatihan Kerja (LPK) Bahasa Jepang terpercaya dan berintegritas. Membimbing generasi muda menguasai bahasa Jepang, etos kerja profesional, dan meraih masa depan berkarier resmi di Jepang bersama LPK Lombok Shorai Rinjani.',
                'group' => 'general',
                'type' => 'text',
                'description' => 'Official institutional summary and mission',
            ],
            [
                'key' => 'logo',
                'value' => '/assets/brand/logo.png',
                'group' => 'branding',
                'type' => 'image',
                'description' => 'Primary transparent PNG logo path',
            ],
            [
                'key' => 'favicon',
                'value' => '/assets/brand/logo.png',
                'group' => 'branding',
                'type' => 'image',
                'description' => 'Website browser favicon path',
            ],
            [
                'key' => 'email',
                'value' => 'info@lombokshorairinjani.co.id',
                'group' => 'contact',
                'type' => 'string',
                'description' => 'Primary official contact email address',
            ],
            [
                'key' => 'phone',
                'value' => '+62 821-4567-8901',
                'group' => 'contact',
                'type' => 'string',
                'description' => 'Official customer care telephone line',
            ],
            [
                'key' => 'whatsapp',
                'value' => '6282145678901',
                'group' => 'contact',
                'type' => 'string',
                'description' => 'Direct official WhatsApp hotline number',
            ],
            [
                'key' => 'address',
                'value' => 'Gedung Lombok Shorai Center, Jl. Raya Senggigi No. 88, Mataram, Nusa Tenggara Barat, Indonesia 83125',
                'group' => 'contact',
                'type' => 'text',
                'description' => 'Physical campus location and mailing address',
            ],
            [
                'key' => 'instagram',
                'value' => 'https://instagram.com/lombokshorairinjani',
                'group' => 'social',
                'type' => 'url',
                'description' => 'Official Instagram social profile URL',
            ],
            [
                'key' => 'facebook',
                'value' => 'https://facebook.com/lombokshorairinjani',
                'group' => 'social',
                'type' => 'url',
                'description' => 'Official Facebook page URL',
            ],
            [
                'key' => 'youtube',
                'value' => 'https://youtube.com/@lombokshorairinjani',
                'group' => 'social',
                'type' => 'url',
                'description' => 'Official YouTube channel URL',
            ],
            [
                'key' => 'default_language',
                'value' => 'id',
                'group' => 'localization',
                'type' => 'string',
                'description' => 'Default system language code',
            ],
            [
                'key' => 'available_languages',
                'value' => ['id', 'en', 'jp'],
                'group' => 'localization',
                'type' => 'json',
                'description' => 'Array of supported interface language codes',
            ],
            [
                'key' => 'theme_settings',
                'value' => [
                    'default' => 'light',
                    'allowSwitch' => true,
                    'primaryColor' => '#C53030',
                ],
                'group' => 'appearance',
                'type' => 'json',
                'description' => 'Visual theme identity configurations',
            ],
            [
                'key' => 'seo_title',
                'value' => 'LPK Lombok Shorai Rinjani | Japanese Language Education School',
                'group' => 'seo',
                'type' => 'string',
                'description' => 'Global website title tag for search engines',
            ],
            [
                'key' => 'seo_description',
                'value' => 'LPK Lombok Shorai Rinjani - Lembaga Pelatihan Kerja (LPK) Bahasa Jepang terkemuka. Pendidikan terarah, persiapan JLPT, Tokutei Ginou (SSW), dan bimbingan karier terpercaya menuju Jepang.',
                'group' => 'seo',
                'type' => 'text',
                'description' => 'Global meta description for search engine optimization',
            ],
        ];

        foreach ($settings as $setting) {
            SiteSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
