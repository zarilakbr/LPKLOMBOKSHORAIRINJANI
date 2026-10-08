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
use App\Http\Controllers\Api\RealtimeStreamController;
use App\Http\Controllers\Api\PermissionAttachmentDownloadController;

// Admin API Controllers
use App\Http\Controllers\Api\Admin\AdminProgramController;
use App\Http\Controllers\Api\Admin\AdminClassController;
use App\Http\Controllers\Api\Admin\AdminScheduleController;
use App\Http\Controllers\Api\Admin\AdminEnrollmentController;
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
use App\Http\Controllers\Api\Admin\AdminAttendanceController;
use App\Http\Controllers\Api\Admin\AdminPermissionController;
use App\Http\Controllers\Api\Admin\AdminNotificationController;
use App\Http\Controllers\Api\Admin\AdminResumeController;

// Student API Controllers
use App\Http\Controllers\Api\Student\StudentProfileController;
use App\Http\Controllers\Api\Student\StudentResumeController;
use App\Http\Controllers\Api\Student\StudentRegistrationController;
use App\Http\Controllers\Api\Student\StudentClassController;
use App\Http\Controllers\Api\Student\StudentAttendanceController;
use App\Http\Controllers\Api\Student\StudentPermissionController;
use App\Http\Controllers\Api\Student\StudentNotificationController;
use App\Http\Controllers\Api\Student\StudentEnrollmentController;

// Teacher API Controllers
use App\Http\Controllers\Api\Teacher\TeacherProfileController;
use App\Http\Controllers\Api\Teacher\TeacherClassController;
use App\Http\Controllers\Api\Teacher\TeacherStudentController;
use App\Http\Controllers\Api\Teacher\TeacherAttendanceController;
use App\Http\Controllers\Api\Teacher\TeacherPermissionController;
use App\Http\Controllers\Api\Teacher\TeacherNotificationController;
use App\Http\Controllers\Api\Teacher\TeacherMaterialController;
use App\Http\Controllers\Api\Admin\AdminMaterialController;
use App\Http\Controllers\Api\Student\StudentMaterialController;

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

    // Public Site & Contact Settings
    Route::get('/settings', [AdminSettingController::class, 'publicSettings']);

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
    Route::post('/login', [AuthController::class, 'login'])->name('login')->middleware('throttle:10,1');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:10,1');

    // Google OAuth Routes
    Route::get('/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::post('/google/callback', [AuthController::class, 'googleCallback'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

/*
|--------------------------------------------------------------------------
| Realtime Broadcasting & SSE Stream Routes (Protected)
|--------------------------------------------------------------------------
*/
Route::prefix('realtime')->middleware('auth:sanctum')->group(function () {
    Route::get('/events', [RealtimeStreamController::class, 'events'])->middleware('throttle:60,1');
    Route::get('/stream', [RealtimeStreamController::class, 'stream'])->middleware('throttle:60,1');
    Route::post('/auth', [RealtimeStreamController::class, 'authorizeChannel'])->middleware('throttle:60,1');
});

/*
|--------------------------------------------------------------------------
| Admin CMS API Routes (Protected)
|--------------------------------------------------------------------------
| Protected via Sanctum authentication and RoleMiddleware (RBAC).
*/
Route::prefix('admin')->middleware(['auth:sanctum', 'role:ADMIN'])->group(function () {
    // Registrations Pipeline
    Route::apiResource('registrations', AdminRegistrationController::class)->except(['store']);

    // Program Management
    Route::apiResource('programs', AdminProgramController::class);

    // Class Batches Management
    Route::apiResource('classes', AdminClassController::class);

    // Class Schedules Management (Timetabled Sessions)
    Route::apiResource('schedules', AdminScheduleController::class);

    // Class Enrollments Management (Student <-> Class allocations)
    Route::apiResource('enrollments', AdminEnrollmentController::class);

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

    // Site Settings (Admin only)
    Route::get('/settings', [AdminSettingController::class, 'index']);
    Route::put('/settings', [AdminSettingController::class, 'update']);

    // User & Account Management & Approval (Admin only)
    Route::post('/users/{id}/approve', [AdminUserController::class, 'approve']);
    Route::post('/users/{id}/reject', [AdminUserController::class, 'reject']);
    Route::apiResource('users', AdminUserController::class);

    // Attendance Management (Admin full CRUD)
    Route::apiResource('attendance', AdminAttendanceController::class);

    // Permission Requests Management (Admin Review & Approval)
    Route::get('/permissions', [AdminPermissionController::class, 'index']);
    Route::get('/permissions/{id}', [AdminPermissionController::class, 'show']);
    Route::patch('/permissions/{id}/review', [AdminPermissionController::class, 'review']);
    Route::post('/permissions/{id}/approve', [AdminPermissionController::class, 'approve']);
    Route::post('/permissions/{id}/reject', [AdminPermissionController::class, 'reject']);
    Route::get('/permissions/{permissionId}/attachments/{attachmentId}/download', [AdminPermissionController::class, 'downloadAttachment']);

    // Admin Notifications (CRUD & Broadcast)
    Route::get('/notifications', [AdminNotificationController::class, 'index']);
    Route::post('/notifications', [AdminNotificationController::class, 'store']);
    Route::post('/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [AdminNotificationController::class, 'destroy']);

    // Learning Materials Management (Admin CRUD & Download)
    Route::get('/materials/{id}/download', [AdminMaterialController::class, 'download']);
    Route::apiResource('materials', AdminMaterialController::class);

    // Japanese Resume Management (履歴書)
    Route::get('/resumes', [AdminResumeController::class, 'index']);
    Route::get('/resumes/{id}', [AdminResumeController::class, 'show']);
    Route::put('/resumes/{id}', [AdminResumeController::class, 'update']);
    Route::post('/resumes/{id}/upload-photo', [AdminResumeController::class, 'uploadPhoto']);
});

/*
|--------------------------------------------------------------------------
| Student Portal API Routes (Protected)
|--------------------------------------------------------------------------
| Protected via Sanctum authentication and RoleMiddleware (role:SISWA).
*/
Route::prefix('student')->middleware(['auth:sanctum', 'role:SISWA'])->group(function () {
    // Profile
    Route::get('/profile', [StudentProfileController::class, 'show']);
    Route::match(['put', 'patch'], '/profile', [StudentProfileController::class, 'update']);

    // Japanese Resume (履歴書)
    Route::get('/resume', [StudentResumeController::class, 'show']);
    Route::post('/resume', [StudentResumeController::class, 'save']);
    Route::post('/resume/upload-photo', [StudentResumeController::class, 'uploadPhoto']);

    // Registrations
    Route::get('/registrations', [StudentRegistrationController::class, 'index']);
    Route::get('/registrations/{id}', [StudentRegistrationController::class, 'show']);

    // Classes & Schedule & Enrollments
    Route::get('/enrollments', [StudentEnrollmentController::class, 'index']);
    Route::get('/enrollments/{id}', [StudentEnrollmentController::class, 'show']);
    Route::get('/classes', [StudentClassController::class, 'index']);
    Route::get('/classes/{id}', [StudentClassController::class, 'show']);
    Route::get('/schedule', [StudentClassController::class, 'schedule']);

    // Attendance
    Route::get('/attendance', [StudentAttendanceController::class, 'index']);
    Route::get('/attendance/{id}', [StudentAttendanceController::class, 'show']);
    Route::post('/attendance/check-in', [StudentAttendanceController::class, 'checkIn'])
        ->middleware('throttle:20,1');

    // Permissions & Attachments
    Route::get('/permissions', [StudentPermissionController::class, 'index']);
    Route::post('/permissions', [StudentPermissionController::class, 'store'])
        ->middleware('throttle:10,1');
    Route::get('/permissions/{id}', [StudentPermissionController::class, 'show']);
    Route::match(['put', 'patch'], '/permissions/{id}', [StudentPermissionController::class, 'update']);
    Route::post('/permissions/{id}/attachments', [StudentPermissionController::class, 'uploadAttachment'])
        ->middleware('throttle:10,1');
    Route::get('/permissions/{permissionId}/attachments/{attachmentId}/download', [StudentPermissionController::class, 'downloadAttachment']);

    // Learning Materials (ACTIVE Enrolled Classes Only)
    Route::get('/materials', [StudentMaterialController::class, 'index']);
    Route::get('/materials/{id}', [StudentMaterialController::class, 'show']);
    Route::get('/materials/{id}/download', [StudentMaterialController::class, 'download']);

    // Notifications
    Route::get('/notifications', [StudentNotificationController::class, 'index']);
    Route::get('/notifications/{id}', [StudentNotificationController::class, 'show']);
    Route::post('/notifications/{id}/read', [StudentNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [StudentNotificationController::class, 'markAllAsRead']);
});

/*
|--------------------------------------------------------------------------
| Teacher Portal API Routes (Protected)
|--------------------------------------------------------------------------
| Protected via Sanctum authentication and RoleMiddleware (role:PENGAJAR).
*/
Route::prefix('teacher')->middleware(['auth:sanctum', 'role:PENGAJAR'])->group(function () {
    // Profile
    Route::get('/profile', [TeacherProfileController::class, 'show']);
    Route::match(['put', 'patch'], '/profile', [TeacherProfileController::class, 'update']);

    // Classes & Schedule
    Route::get('/classes', [TeacherClassController::class, 'index']);
    Route::post('/classes', [TeacherClassController::class, 'store']);
    Route::get('/classes/{id}', [TeacherClassController::class, 'show']);
    Route::match(['put', 'patch'], '/classes/{id}', [TeacherClassController::class, 'update']);
    Route::delete('/classes/{id}', [TeacherClassController::class, 'destroy']);
    Route::get('/schedule', [TeacherClassController::class, 'schedule']);
    Route::post('/schedule', [TeacherClassController::class, 'storeSchedule']);
    Route::get('/schedule/{id}', [TeacherClassController::class, 'showSchedule']);
    Route::match(['put', 'patch'], '/schedule/{id}', [TeacherClassController::class, 'updateSchedule']);
    Route::delete('/schedule/{id}', [TeacherClassController::class, 'destroySchedule']);

    // Students
    Route::get('/students', [TeacherStudentController::class, 'index']);
    Route::get('/classes/{classId}/students', [TeacherStudentController::class, 'classStudents']);

    // Attendance
    Route::get('/attendance', [TeacherAttendanceController::class, 'index']);
    Route::get('/classes/{classId}/attendance', [TeacherAttendanceController::class, 'classAttendance']);
    Route::post('/attendance', [TeacherAttendanceController::class, 'store']);
    Route::patch('/attendance/{id}', [TeacherAttendanceController::class, 'update']);

    // Permissions
    Route::get('/permissions', [TeacherPermissionController::class, 'index']);
    Route::get('/permissions/{id}', [TeacherPermissionController::class, 'show']);
    Route::patch('/permissions/{id}/review', [TeacherPermissionController::class, 'review'])
        ->middleware('throttle:20,1');
    Route::get('/permissions/{permissionId}/attachments/{attachmentId}/download', [TeacherPermissionController::class, 'downloadAttachment']);

    // Learning Materials Management (Assigned Classes Only)
    Route::get('/materials', [TeacherMaterialController::class, 'index']);
    Route::post('/materials', [TeacherMaterialController::class, 'store'])
        ->middleware('throttle:30,1');
    Route::get('/materials/{id}', [TeacherMaterialController::class, 'show']);
    Route::match(['put', 'patch'], '/materials/{id}', [TeacherMaterialController::class, 'update']);
    Route::post('/materials/{id}', [TeacherMaterialController::class, 'update'])
        ->middleware('throttle:30,1');
    Route::delete('/materials/{id}', [TeacherMaterialController::class, 'destroy']);
    Route::get('/materials/{id}/download', [TeacherMaterialController::class, 'download']);

    // Notifications
    Route::get('/notifications', [TeacherNotificationController::class, 'index']);
    Route::get('/notifications/{id}', [TeacherNotificationController::class, 'show']);
    Route::post('/notifications/{id}/read', [TeacherNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [TeacherNotificationController::class, 'markAllAsRead']);
});

/*
|--------------------------------------------------------------------------
| Protected Direct Attachment Downloads (Sanctum Authenticated)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/permissions/{permissionId}/attachments/{attachmentId}/download', [PermissionAttachmentDownloadController::class, 'download']);
});
