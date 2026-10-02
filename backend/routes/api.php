<?php

use Illuminate\Support\Facades\Route;

// Public API Controllers
use App\Http\Controllers\Api\Public\ProgramController;
use App\Http\Controllers\Api\Public\ClassController;
use App\Http\Controllers\Api\Public\OpportunityController;
use App\Http\Controllers\Api\Public\TestimonialController;
use App\Http\Controllers\Api\Public\ArticleController;
use App\Http\Controllers\Api\Public\GalleryController;
use App\Http\Controllers\Api\Public\FacilityController;
use App\Http\Controllers\Api\Public\FaqController;
use App\Http\Controllers\Api\Public\RegistrationController;

// Auth Controller
use App\Http\Controllers\Api\Auth\AuthController;

// Admin API Controllers
use App\Http\Controllers\Api\Admin\AdminProgramController;
use App\Http\Controllers\Api\Admin\AdminClassController;
use App\Http\Controllers\Api\Admin\AdminOpportunityController;
use App\Http\Controllers\Api\Admin\AdminRegistrationController;
use App\Http\Controllers\Api\Admin\AdminTestimonialController;
use App\Http\Controllers\Api\Admin\AdminArticleController;
use App\Http\Controllers\Api\Admin\AdminGalleryController;
use App\Http\Controllers\Api\Admin\AdminFacilityController;
use App\Http\Controllers\Api\Admin\AdminFaqController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\Admin\AdminSettingController;
use App\Http\Controllers\Api\Admin\AdminActivityLogController;

/*
|--------------------------------------------------------------------------
| Public API Routes
|--------------------------------------------------------------------------
| Publicly accessible endpoints for the LPK website frontend.
| Rate-limited to prevent abuse.
*/
Route::middleware(['throttle:60,1'])->group(function () {
    // Programs
    Route::get('/programs', [ProgramController::class, 'index']);
    Route::get('/programs/{slug}', [ProgramController::class, 'show']);

    // Classes / Schedules
    Route::get('/classes', [ClassController::class, 'index']);

    // Career Opportunities in Japan
    Route::get('/opportunities', [OpportunityController::class, 'index']);
    Route::get('/opportunities/{slug}', [OpportunityController::class, 'show']);

    // Testimonials
    Route::get('/testimonials', [TestimonialController::class, 'index']);

    // Articles & Guides
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/{slug}', [ArticleController::class, 'show']);

    // Gallery
    Route::get('/gallery', [GalleryController::class, 'index']);

    // Facilities
    Route::get('/facilities', [FacilityController::class, 'index']);

    // FAQs
    Route::get('/faqs', [FaqController::class, 'index']);

    // Student Online Registration (with stricter rate limit)
    Route::post('/registrations', [RegistrationController::class, 'store'])
        ->middleware('throttle:10,1');
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');

    // Google OAuth Routes
    Route::get('/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::post('/google/callback', [AuthController::class, 'googleCallback']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| Admin CMS API Routes (Protected)
|--------------------------------------------------------------------------
| Protected via Sanctum authentication and RoleMiddleware (RBAC).
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'role:SUPER_ADMIN,ADMIN,STAFF'])->group(function () {
    // Registrations Pipeline
    Route::apiResource('registrations', AdminRegistrationController::class)->except(['store']);

    // Program Management
    Route::apiResource('programs', AdminProgramController::class);

    // Class Batches Management
    Route::apiResource('classes', AdminClassController::class);

    // Job Opportunities Management
    Route::apiResource('opportunities', AdminOpportunityController::class);

    // Testimonials Management
    Route::apiResource('testimonials', AdminTestimonialController::class);

    // Articles CMS
    Route::apiResource('articles', AdminArticleController::class);

    // Gallery CMS
    Route::apiResource('gallery', AdminGalleryController::class);

    // Facilities CMS
    Route::apiResource('facilities', AdminFacilityController::class);

    // FAQ CMS
    Route::apiResource('faqs', AdminFaqController::class);

    // Activity Logs (Read-only audit trail)
    Route::get('/activity-logs', [AdminActivityLogController::class, 'index']);

    // Site Settings (SuperAdmin & Admin only)
    Route::middleware('role:SUPER_ADMIN,ADMIN')->group(function () {
        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::put('/settings', [AdminSettingController::class, 'update']);
    });

    // User & Staff Management (SuperAdmin only)
    Route::middleware('role:SUPER_ADMIN')->group(function () {
        Route::apiResource('users', AdminUserController::class);
    });
});
