<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            SiteSettingSeeder::class,
            ProgramSeeder::class,
            ClassSeeder::class,
            OpportunitySeeder::class,
            TestimonialSeeder::class,
            ArticleSeeder::class,
            GallerySeeder::class,
            FacilitySeeder::class,
            FaqSeeder::class,
            RegistrationSeeder::class,
            ContactSeeder::class,
            ActivityLogSeeder::class,
            AttendanceSeeder::class,
            PermissionRequestSeeder::class,
            NotificationSeeder::class,
        ]);
    }
}
