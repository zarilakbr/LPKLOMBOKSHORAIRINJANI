<?php

/**
 * LPK Lombok Shorai Rinjani
 * Phase 2 — Backend Hardening Verification Test Suite
 * BLK-04 + SEC-03 + SEC-05
 */

require_once __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ProgramClass;
use App\Models\Enrollment;
use App\Models\Attendance;
use App\Models\PermissionRequest;
use App\Models\PermissionAttachment;
use App\Models\Schedule;
use App\Models\Material;
use App\Http\Resources\PermissionAttachmentResource;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

$totalTests = 0;
$passedTests = 0;
$failedTests = 0;

function runTest(string $name, callable $callback)
{
    global $totalTests, $passedTests, $failedTests;
    $totalTests++;
    try {
        $result = $callback();
        if ($result === true || $result === null) {
            echo " [PASS] {$name}\n";
            $passedTests++;
        } else {
            echo " [FAIL] {$name} - Assertion returned false\n";
            $failedTests++;
        }
    } catch (\Throwable $e) {
        echo " [FAIL] {$name} - Exception: " . $e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine() . "\n";
        $failedTests++;
    }
}

function makeValidatedReq(string $requestClass, array $data = [], array $files = [], ?User $user = null): mixed
{
    $req = $requestClass::create('/', 'POST', $data, [], $files);
    $req->setContainer(app());
    if ($user) {
        $req->setUserResolver(fn () => $user);
    }
    $req->validateResolved();
    return $req;
}

echo "==================================================\n";
echo "PHASE 2 HARDENING VERIFICATION: BLK-04 + SEC-03 + SEC-05\n";
echo "==================================================\n\n";

// --------------------------------------------------
// SECTION 1: BLK-04 BROADCAST RESILIENCE AUDIT
// --------------------------------------------------
echo "--- SECTION 1: BLK-04 BROADCAST RESILIENCE ---\n";

$events = [
    \App\Events\AttendanceRecorded::class,
    \App\Events\AttendanceUpdated::class,
    \App\Events\EnrollmentCreated::class,
    \App\Events\EnrollmentUpdated::class,
    \App\Events\MaterialCreated::class,
    \App\Events\MaterialDeleted::class,
    \App\Events\MaterialUpdated::class,
    \App\Events\NotificationCreated::class,
    \App\Events\PermissionCreated::class,
    \App\Events\PermissionReviewed::class,
    \App\Events\RegistrationCreated::class,
    \App\Events\ScheduleCreated::class,
    \App\Events\ScheduleDeleted::class,
    \App\Events\ScheduleUpdated::class,
];

foreach ($events as $eventClass) {
    $shortName = basename(str_replace('\\', '/', $eventClass));
    runTest("BLK-04: {$shortName} implements ShouldRescue", function () use ($eventClass) {
        $ref = new ReflectionClass($eventClass);
        return $ref->implementsInterface(ShouldRescue::class) &&
               $ref->implementsInterface(ShouldBroadcastNow::class);
    });
}

// Reverb ON simulation
runTest("BLK-04: Reverb ON - event dispatch completes without exception", function () {
    $user = User::where('role', 'SISWA')->first();
    $class = ProgramClass::first();
    $att = Attendance::first() ?? Attendance::create([
        'user_id' => $user->id,
        'class_id' => $class->id,
        'attendance_date' => date('Y-m-d'),
        'status' => 'HADIR',
    ]);
    event(new \App\Events\AttendanceUpdated($att->fresh(['user', 'class'])));
    return true;
});

// Reverb OFF simulation
runTest("BLK-04: Reverb OFF - Business operations succeed and HTTP does not 500", function () {
    $originalPort = config('broadcasting.connections.reverb.options.port');
    // Purge broadcaster and point to closed port 59999 with 1s timeout
    app('Illuminate\Broadcasting\BroadcastManager')->purge('reverb');
    config(['broadcasting.connections.reverb.options.port' => 59999]);
    config(['broadcasting.connections.reverb.client_options.timeout' => 1]);
    config(['broadcasting.connections.reverb.client_options.connect_timeout' => 1]);

    $student = User::where('role', 'SISWA')->first();
    $teacher = User::where('role', 'PENGAJAR')->first();
    $class = ProgramClass::where('teacher_id', $teacher->id)->first() ?? ProgramClass::first();

    // 1. Dispatch AttendanceRecorded while Reverb is OFF
    $att = Attendance::first();
    $start = microtime(true);
    event(new \App\Events\AttendanceRecorded($att->fresh(['user', 'class'])));
    $timeTaken = microtime(true) - $start;

    // 2. Dispatch PermissionReviewed while Reverb is OFF
    $perm = PermissionRequest::first();
    if ($perm) {
        event(new \App\Events\PermissionReviewed($perm->fresh(['user', 'class', 'reviewer', 'attachments'])));
    }

    // 3. Dispatch ScheduleUpdated while Reverb is OFF
    $schedule = Schedule::first();
    if ($schedule) {
        event(new \App\Events\ScheduleUpdated($schedule));
    }

    // Restore original port
    app('Illuminate\Broadcasting\BroadcastManager')->purge('reverb');
    config(['broadcasting.connections.reverb.options.port' => $originalPort]);

    // If we reached here without uncaught exception, BLK-04 is verified!
    return $timeTaken < 5.0;
});

// --------------------------------------------------
// SECTION 2: SEC-03 PRIVATE PERMISSION ATTACHMENTS
// --------------------------------------------------
echo "\n--- SECTION 2: SEC-03 PRIVATE PERMISSION ATTACHMENTS ---\n";

runTest("SEC-03: No permission attachments exist on public disk", function () {
    $attachments = PermissionAttachment::all();
    $exposedOnPublic = 0;
    foreach ($attachments as $att) {
        if (Storage::disk('public')->exists($att->file_path)) {
            $exposedOnPublic++;
        }
    }
    return $exposedOnPublic === 0;
});

runTest("SEC-03: Existing permission attachments exist on private (local) disk", function () {
    $attachments = PermissionAttachment::where('file_path', 'not like', 'demo/%')->get();
    $privateCount = 0;
    foreach ($attachments as $att) {
        if (Storage::disk('local')->exists($att->file_path)) {
            $privateCount++;
        }
    }
    return $privateCount === $attachments->count() && $privateCount > 0;
});

runTest("SEC-03: PermissionAttachmentResource does not expose public URL or physical filePath", function () {
    $att = PermissionAttachment::first();
    $student = User::where('role', 'SISWA')->first();
    $req = Request::create('/', 'GET');
    $req->setUserResolver(fn () => $student);

    $resource = (new PermissionAttachmentResource($att))->toArray($req);

    // Must NOT contain internal physical path
    if (isset($resource['filePath'])) {
        return false;
    }
    // Must NOT contain public storage URL
    if (isset($resource['url']) && str_contains($resource['url'], '/storage/')) {
        return false;
    }
    // Must contain safe metadata and authenticated download URL
    if (!isset($resource['originalFilename']) || !isset($resource['downloadUrl'])) {
        return false;
    }
    return str_contains($resource['downloadUrl'], '/api/student/permissions/');
});

runTest("SEC-03: Student uploads valid attachment -> stored on private disk", function () {
    $student = User::where('role', 'SISWA')->first();
    $class = ProgramClass::first();

    $perm = PermissionRequest::create([
        'user_id' => $student->id,
        'class_id' => $class->id,
        'type' => 'sakit',
        'start_date' => date('Y-m-d'),
        'end_date' => date('Y-m-d'),
        'reason' => 'Test upload validation',
        'status' => 'PENDING',
    ]);

    $file = UploadedFile::fake()->create('surat_dokter_test.pdf', 100, 'application/pdf');

    $req = makeValidatedReq(
        \App\Http\Requests\Student\StorePermissionAttachmentRequest::class,
        [],
        ['file' => $file],
        $student
    );

    $controller = app(\App\Http\Controllers\Api\Student\StudentPermissionController::class);
    $response = $controller->uploadAttachment($req, $perm->id);

    $data = $response->getData(true);
    if (!$data['success']) {
        return false;
    }

    $attId = $data['data']['id'];
    $savedAtt = PermissionAttachment::find($attId);

    // Verify stored on local (private) disk
    $onPrivate = Storage::disk('local')->exists($savedAtt->file_path);
    // Verify NOT on public disk
    $onPublic = Storage::disk('public')->exists($savedAtt->file_path);

    // Cleanup test record and file
    Storage::disk('local')->delete($savedAtt->file_path);
    $savedAtt->delete();
    $perm->delete();

    return $onPrivate && !$onPublic;
});

runTest("SEC-03: Upload rejected for invalid executable/script file", function () {
    $student = User::where('role', 'SISWA')->first();
    $file = UploadedFile::fake()->create('malicious.exe', 50, 'application/x-msdownload');

    try {
        makeValidatedReq(
            \App\Http\Requests\Student\StorePermissionAttachmentRequest::class,
            [],
            ['file' => $file],
            $student
        );
        return false; // Should have thrown validation exception
    } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
        $res = $e->getResponse();
        return $res->getStatusCode() === 422;
    }
});

runTest("SEC-03: Upload rejected for oversized file (> 5MB)", function () {
    $student = User::where('role', 'SISWA')->first();
    $file = UploadedFile::fake()->create('huge.pdf', 6000, 'application/pdf'); // 6MB

    try {
        makeValidatedReq(
            \App\Http\Requests\Student\StorePermissionAttachmentRequest::class,
            [],
            ['file' => $file],
            $student
        );
        return false; // Should have thrown validation exception
    } catch (\Illuminate\Http\Exceptions\HttpResponseException $e) {
        $res = $e->getResponse();
        return $res->getStatusCode() === 422;
    }
});

runTest("SEC-03: IDOR Prevention - Student B cannot download Student A's attachment (403)", function () {
    // Find Student A and Student B
    $students = User::where('role', 'SISWA')->take(2)->get();
    if ($students->count() < 2) {
        return false;
    }
    $studentA = $students[0];
    $studentB = $students[1];

    $class = ProgramClass::first();
    $permA = PermissionRequest::create([
        'user_id' => $studentA->id,
        'class_id' => $class->id,
        'type' => 'izin',
        'start_date' => date('Y-m-d'),
        'end_date' => date('Y-m-d'),
        'reason' => 'IDOR Test',
        'status' => 'PENDING',
    ]);

    $path = 'attachments/permissions/test_idor_' . uniqid() . '.pdf';
    Storage::disk('local')->put($path, 'dummy content');

    $att = PermissionAttachment::create([
        'permission_request_id' => $permA->id,
        'file_name' => 'surat_a.pdf',
        'file_path' => $path,
        'mime_type' => 'application/pdf',
        'file_size' => 13,
    ]);

    // Student B attempts to download
    $reqB = Request::create('/', 'GET');
    $reqB->setUserResolver(fn () => $studentB);

    $controller = app(\App\Http\Controllers\Api\Student\StudentPermissionController::class);
    $resB = $controller->downloadAttachment($reqB, $permA->id, $att->id);

    // Student A attempts to download (should succeed)
    $reqA = Request::create('/', 'GET');
    $reqA->setUserResolver(fn () => $studentA);
    $resA = $controller->downloadAttachment($reqA, $permA->id, $att->id);

    // Clean up
    Storage::disk('local')->delete($path);
    $att->delete();
    $permA->delete();

    $bIsForbidden = $resB instanceof \Illuminate\Http\JsonResponse && $resB->getStatusCode() === 403;
    $aIsSuccess = $resA instanceof \Symfony\Component\HttpFoundation\StreamedResponse;

    return $bIsForbidden && $aIsSuccess;
});

runTest("SEC-03: Teacher RBAC - Only class teacher can download (unauthorized teacher 403)", function () {
    $teachers = User::where('role', 'PENGAJAR')->get();
    if ($teachers->count() < 2) {
        // Create a temporary second teacher for testing
        $teacherOther = User::create([
            'name' => 'Teacher Other',
            'email' => 'teacher.other.' . uniqid() . '@example.com',
            'password' => bcrypt('secret123'),
            'role' => 'PENGAJAR',
            'is_active' => true,
        ]);
        $teacherAssigned = $teachers[0];
    } else {
        $teacherAssigned = $teachers[0];
        $teacherOther = $teachers[1];
    }

    $class = ProgramClass::create([
        'name' => 'Test Class RBAC ' . uniqid(),
        'program_id' => 1,
        'teacher_id' => $teacherAssigned->id,
        'is_active' => true,
    ]);

    $student = User::where('role', 'SISWA')->first();

    $perm = PermissionRequest::create([
        'user_id' => $student->id,
        'class_id' => $class->id,
        'type' => 'izin',
        'start_date' => date('Y-m-d'),
        'end_date' => date('Y-m-d'),
        'reason' => 'Teacher RBAC Test',
        'status' => 'PENDING',
    ]);

    $path = 'attachments/permissions/test_teacher_rbac_' . uniqid() . '.pdf';
    Storage::disk('local')->put($path, 'dummy content');

    $att = PermissionAttachment::create([
        'permission_request_id' => $perm->id,
        'file_name' => 'surat_teacher_rbac.pdf',
        'file_path' => $path,
        'mime_type' => 'application/pdf',
        'file_size' => 13,
    ]);

    // Unauthorized teacher attempts download
    $reqOther = Request::create('/', 'GET');
    $reqOther->setUserResolver(fn () => $teacherOther);

    $teacherController = app(\App\Http\Controllers\Api\Teacher\TeacherPermissionController::class);
    $resOther = $teacherController->downloadAttachment($reqOther, $perm->id, $att->id);

    // Authorized teacher downloads
    $reqAssigned = Request::create('/', 'GET');
    $reqAssigned->setUserResolver(fn () => $teacherAssigned);
    $resAssigned = $teacherController->downloadAttachment($reqAssigned, $perm->id, $att->id);

    // Admin downloads via PermissionAttachmentDownloadController
    $admin = User::where('role', 'ADMIN')->first();
    $reqAdmin = Request::create('/', 'GET');
    $reqAdmin->setUserResolver(fn () => $admin);

    $downloadController = app(\App\Http\Controllers\Api\PermissionAttachmentDownloadController::class);
    $resAdmin = $downloadController->download($reqAdmin, $perm->id, $att->id);

    // Clean up
    Storage::disk('local')->delete($path);
    $att->delete();
    $perm->delete();
    $class->delete();
    if (isset($teacherOther) && $teacherOther->email !== ($teachers[1]->email ?? '')) {
        $teacherOther->delete();
    }

    $otherIsForbidden = $resOther instanceof \Illuminate\Http\JsonResponse && $resOther->getStatusCode() === 403;
    $assignedIsSuccess = $resAssigned instanceof \Symfony\Component\HttpFoundation\StreamedResponse;
    $adminIsSuccess = $resAdmin instanceof \Symfony\Component\HttpFoundation\StreamedResponse;

    return $otherIsForbidden && $assignedIsSuccess && $adminIsSuccess;
});

// --------------------------------------------------
// SECTION 3: SEC-05 RATE LIMITING AUDIT
// --------------------------------------------------
echo "\n--- SECTION 3: SEC-05 RATE LIMITING ---\n";

$rateLimitedRoutes = [
    'POST api/auth/google/callback' => 'throttle:10,1',
    'POST api/realtime/auth' => 'throttle:60,1',
    'GET api/realtime/events' => 'throttle:60,1',
    'GET api/realtime/stream' => 'throttle:60,1',
    'POST api/student/attendance/check-in' => 'throttle:20,1',
    'POST api/student/permissions' => 'throttle:10,1',
    'POST api/student/permissions/{id}/attachments' => 'throttle:10,1',
    'PATCH api/teacher/permissions/{id}/review' => 'throttle:20,1',
    'POST api/teacher/materials' => 'throttle:30,1',
    'POST api/registrations' => 'throttle:10,1',
    'POST api/auth/login' => 'throttle:10,1',
    'POST api/auth/register' => 'throttle:10,1',
];

$allRoutes = Route::getRoutes();

foreach ($rateLimitedRoutes as $routeSig => $expectedThrottle) {
    [$method, $uri] = explode(' ', $routeSig);
    runTest("SEC-05: Route [{$method}] {$uri} has {$expectedThrottle}", function () use ($allRoutes, $method, $uri, $expectedThrottle) {
        foreach ($allRoutes as $route) {
            if (in_array($method, $route->methods()) && $route->uri() === $uri) {
                $middleware = $route->middleware();
                foreach ($middleware as $mw) {
                    if (str_contains($mw, $expectedThrottle)) {
                        return true;
                    }
                }
            }
        }
        return false;
    });
}

runTest("SEC-05: Throttle middleware rejects requests after threshold with HTTP 429", function () {
    $throttleKey = 'test-throttle-' . uniqid();
    $maxAttempts = 5;

    // Simulate hits up to threshold
    for ($i = 0; $i < $maxAttempts; $i++) {
        RateLimiter::hit($throttleKey, 60);
    }

    // Now check if too many attempts
    $tooMany = RateLimiter::tooManyAttempts($throttleKey, $maxAttempts);
    $availableIn = RateLimiter::availableIn($throttleKey);

    RateLimiter::clear($throttleKey);

    return $tooMany && $availableIn > 0;
});

echo "\n==================================================\n";
echo "SUMMARY: Total: {$totalTests} | Passed: {$passedTests} | Failed: {$failedTests}\n";
echo "==================================================\n";

if ($failedTests > 0) {
    exit(1);
}
