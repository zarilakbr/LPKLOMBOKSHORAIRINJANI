<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Registration;
use App\Models\Attendance;
use App\Models\PermissionRequest;
use App\Models\Notification;
use App\Models\ProgramClass;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

function apiRequest($method, $uri, $token = null, $data = [], $files = []) {
    app('auth')->forgetGuards();

    $server = [
        'REQUEST_METHOD' => $method,
        'REQUEST_URI'    => $uri,
        'HTTP_ACCEPT'    => 'application/json',
    ];
    if ($token) {
        $server['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
    }

    $parameters = [];
    $content = null;

    if (!empty($files)) {
        $parameters = $data;
    } else {
        $server['CONTENT_TYPE'] = 'application/json';
        $content = json_encode($data);
    }

    $req = Request::create($uri, $method, $parameters, [], $files, $server, $content);
    $res = app()->handle($req);

    return [
        'status' => $res->getStatusCode(),
        'json'   => json_decode($res->getContent(), true) ?: []
    ];
}

echo "=== STUDENT & TEACHER API VERIFICATION SUITE ===\n\n";

// 1. Prepare Auth Tokens
$studentA = User::where('email', 'student@example.test')->first();
$studentB = User::where('email', 'ahmad.fajar@example.test')->first();
$teacherA = User::where('email', 'teacher@example.test')->first();
$teacherB = User::where('email', 'rina.sensei@lombokshorairinjani.co.id')->first();
$admin    = User::where('email', 'admin@example.test')->first();

$tokenStudentA = $studentA->createToken('test-student-a')->plainTextToken;
$tokenStudentB = $studentB->createToken('test-student-b')->plainTextToken;
$tokenTeacherA = $teacherA->createToken('test-teacher-a')->plainTextToken;
$tokenTeacherB = $teacherB->createToken('test-teacher-b')->plainTextToken;
$tokenAdmin    = $admin->createToken('test-admin')->plainTextToken;

$passed = 0;
$failed = 0;

function assertTest($name, $expectedStatus, $actualStatus, $condition = true) {
    global $passed, $failed;
    $statusMatch = ($expectedStatus === $actualStatus);
    if ($statusMatch && $condition) {
        echo "[PASS] {$name} (HTTP {$actualStatus})\n";
        $passed++;
    } else {
        echo "[FAIL] {$name} (Expected: {$expectedStatus}, Got: {$actualStatus})\n";
        $failed++;
    }
}

// -------------------------
// AUTH TESTS (1-2)
// -------------------------
echo "--- GROUP 1: AUTHENTICATION ---\n";
$res1 = apiRequest('GET', '/api/student/profile');
assertTest('1. Unauthenticated -> Student API', 401, $res1['status']);

$res2 = apiRequest('GET', '/api/teacher/profile');
assertTest('2. Unauthenticated -> Teacher API', 401, $res2['status']);

// -------------------------
// ROLE TESTS (3-8)
// -------------------------
echo "\n--- GROUP 2: ROLE AUTHORIZATION ---\n";
$res3 = apiRequest('GET', '/api/student/profile', $tokenStudentA);
assertTest('3. SISWA -> Student API', 200, $res3['status']);

$res4 = apiRequest('GET', '/api/student/profile', $tokenTeacherA);
assertTest('4. PENGAJAR -> Student API', 403, $res4['status']);

$res5 = apiRequest('GET', '/api/student/profile', $tokenAdmin);
assertTest('5. ADMIN -> Student API', 403, $res5['status']);

$res6 = apiRequest('GET', '/api/teacher/profile', $tokenTeacherA);
assertTest('6. PENGAJAR -> Teacher API', 200, $res6['status']);

$res7 = apiRequest('GET', '/api/teacher/profile', $tokenStudentA);
assertTest('7. SISWA -> Teacher API', 403, $res7['status']);

$res8 = apiRequest('GET', '/api/teacher/profile', $tokenAdmin);
assertTest('8. ADMIN -> Teacher API', 403, $res8['status']);

// -------------------------
// OWNERSHIP / IDOR TESTS (9-15)
// -------------------------
echo "\n--- GROUP 3: RESOURCE OWNERSHIP & IDOR PROTECTION ---\n";
// Find Student B's registration, attendance, permission, notification
$regB = Registration::where('user_id', $studentB->id)->first();
$attB = Attendance::where('user_id', $studentB->id)->first();
if (!$attB) {
    // create one for Student B to test IDOR
    $firstClass = ProgramClass::first();
    $attB = Attendance::create([
        'user_id' => $studentB->id,
        'class_id' => $firstClass->id,
        'attendance_date' => '2026-09-01',
        'status' => 'hadir',
        'notes' => 'Test IDOR'
    ]);
}
$permB = PermissionRequest::where('user_id', $studentB->id)->first();
if (!$permB) {
    $firstClass = ProgramClass::first();
    $permB = PermissionRequest::create([
        'user_id' => $studentB->id,
        'class_id' => $firstClass->id,
        'type' => 'izin',
        'start_date' => '2026-09-02',
        'end_date' => '2026-09-02',
        'reason' => 'Test IDOR',
        'status' => 'pending'
    ]);
}
$notifB = Notification::where('user_id', $studentB->id)->first();
if (!$notifB) {
    $notifB = Notification::create([
        'user_id' => $studentB->id,
        'type' => 'info',
        'title' => 'Test IDOR',
        'message' => 'Private message for Student B',
        'is_read' => false
    ]);
}

// 9. Student A -> Student B registration
$res9 = apiRequest('GET', "/api/student/registrations/{$regB->id}", $tokenStudentA);
assertTest('9. Student A -> Student B Registration (IDOR)', 403, $res9['status']);

// 10. Student A -> Student B attendance
$res10 = apiRequest('GET', "/api/student/attendance/{$attB->id}", $tokenStudentA);
assertTest('10. Student A -> Student B Attendance (IDOR)', 403, $res10['status']);

// 11. Student A -> Student B permission
$res11 = apiRequest('GET', "/api/student/permissions/{$permB->id}", $tokenStudentA);
assertTest('11. Student A -> Student B Permission (IDOR)', 403, $res11['status']);

// 12. Student A -> Student B notification
$res12 = apiRequest('GET', "/api/student/notifications/{$notifB->id}", $tokenStudentA);
assertTest('12. Student A -> Student B Notification (IDOR)', 403, $res12['status']);

// Teacher B classes
// Ensure Teacher B has or does not have Teacher A's classes
$classTeacherA = ProgramClass::where('teacher_id', $teacherA->id)->first();
// 13. Teacher B tries to access Teacher A's class
$res13 = apiRequest('GET', "/api/teacher/classes/{$classTeacherA->id}", $tokenTeacherB);
assertTest('13. Teacher B -> Teacher A Class (IDOR)', 403, $res13['status']);

// 14. Teacher B tries to access students in Teacher A's class
$res14 = apiRequest('GET', "/api/teacher/classes/{$classTeacherA->id}/students", $tokenTeacherB);
assertTest('14. Teacher B -> Teacher A Class Students (IDOR)', 403, $res14['status']);

// 15. Teacher B tries to access attendance in Teacher A's class
$res15 = apiRequest('GET', "/api/teacher/classes/{$classTeacherA->id}/attendance", $tokenTeacherB);
assertTest('15. Teacher B -> Teacher A Class Attendance (IDOR)', 403, $res15['status']);

// -------------------------
// VALIDATION TESTS (16-19)
// -------------------------
echo "\n--- GROUP 4: REQUEST VALIDATION ---\n";
// 16. Invalid student permission (missing required fields)
$res16 = apiRequest('POST', '/api/student/permissions', $tokenStudentA, [
    'class_id' => 999999, // non-existent class
    'type' => 'invalid_type',
]);
assertTest('16. Invalid Student Permission Payload', 422, $res16['status']);

// 17. Invalid attendance payload
$res17 = apiRequest('POST', '/api/teacher/attendance', $tokenTeacherA, [
    'class_id' => $classTeacherA->id,
    'status' => 'status_tidak_sah', // invalid status
]);
assertTest('17. Invalid Attendance Payload', 422, $res17['status']);

// 18. Invalid profile payload (e.g. invalid gender)
$res18 = apiRequest('PUT', '/api/student/profile', $tokenStudentA, [
    'gender' => 'alien_gender',
]);
assertTest('18. Invalid Profile Payload', 422, $res18['status']);

// 19. Invalid file upload (e.g. exe or bad format)
$permA = PermissionRequest::where('user_id', $studentA->id)->first();
$fakeExe = UploadedFile::fake()->create('malicious.exe', 100, 'application/x-msdownload');
$res19 = apiRequest('POST', "/api/student/permissions/{$permA->id}/attachments", $tokenStudentA, [], ['file' => $fakeExe]);
assertTest('19. Invalid File Upload (MIME validation)', 422, $res19['status']);

// -------------------------
// SUCCESS TESTS (20-28)
// -------------------------
echo "\n--- GROUP 5: SUCCESSFUL CORE ENDPOINTS ---\n";
// 20. Student profile
$res20 = apiRequest('GET', '/api/student/profile', $tokenStudentA);
assertTest('20. Student Profile Success', 200, $res20['status'], !empty($res20['json']['data']['email']));

// 21. Student registrations
$res21 = apiRequest('GET', '/api/student/registrations', $tokenStudentA);
assertTest('21. Student Registrations Success', 200, $res21['status'], isset($res21['json']['data']));

// 22. Student attendance
$res22 = apiRequest('GET', '/api/student/attendance', $tokenStudentA);
assertTest('22. Student Attendance Success', 200, $res22['status'], isset($res22['json']['summary']));

// 23. Student permissions
$res23 = apiRequest('GET', '/api/student/permissions', $tokenStudentA);
assertTest('23. Student Permissions Success', 200, $res23['status'], isset($res23['json']['data']));

// 24. Student notifications
$res24 = apiRequest('GET', '/api/student/notifications', $tokenStudentA);
assertTest('24. Student Notifications Success', 200, $res24['status'], isset($res24['json']['unreadCount']));

// 25. Teacher profile
$res25 = apiRequest('GET', '/api/teacher/profile', $tokenTeacherA);
assertTest('25. Teacher Profile Success', 200, $res25['status'], !empty($res25['json']['data']['name']));

// 26. Teacher classes
$res26 = apiRequest('GET', '/api/teacher/classes', $tokenTeacherA);
assertTest('26. Teacher Classes Success', 200, $res26['status'], isset($res26['json']['data']));

// 27. Teacher students
$res27 = apiRequest('GET', '/api/teacher/students', $tokenTeacherA);
assertTest('27. Teacher Students Success', 200, $res27['status'], isset($res27['json']['data']));

// 28. Teacher attendance
$res28 = apiRequest('GET', '/api/teacher/attendance', $tokenTeacherA);
assertTest('28. Teacher Attendance Success', 200, $res28['status'], isset($res28['json']['data']));

// Additional check: Valid file upload for permission attachment
echo "\n--- ADDITIONAL FEATURE TEST: VALID ATTACHMENT UPLOAD ---\n";
$validPdf = UploadedFile::fake()->create('surat_dokter.pdf', 250, 'application/pdf');
$resAttach = apiRequest('POST', "/api/student/permissions/{$permA->id}/attachments", $tokenStudentA, [], ['file' => $validPdf]);
assertTest('Valid PDF Attachment Upload', 201, $resAttach['status'], !empty($resAttach['json']['data']['id']) && (!empty($resAttach['json']['data']['filePath']) || !empty($resAttach['json']['data']['downloadUrl'])));

// Additional check: Mark notification as read
$notifA = Notification::where('user_id', $studentA->id)->first();
if ($notifA) {
    $resNotifRead = apiRequest('POST', "/api/student/notifications/{$notifA->id}/read", $tokenStudentA);
    assertTest('Mark Notification Read', 200, $resNotifRead['status'], $resNotifRead['json']['data']['isRead'] === true);
}

// -------------------------
// GROUP 6: FIX-A DATA INTEGRITY & SECURITY TESTS
// -------------------------
echo "\n--- GROUP 6: FIX-A DATA INTEGRITY & SECURITY TESTS ---\n";

// A. Student with no class relationship (ISS-001)
$studentNoClass = User::where('role', 'SISWA')
    ->whereDoesntHave('attendances')
    ->whereDoesntHave('permissionRequests')
    ->first();

if ($studentNoClass) {
    $tokenNoClass = $studentNoClass->createToken('test-no-class')->plainTextToken;

    $resNoClassList = apiRequest('GET', '/api/student/classes', $tokenNoClass);
    assertTest(
        'A1. Student with no class -> GET /api/student/classes (empty 200)',
        200,
        $resNoClassList['status'],
        isset($resNoClassList['json']['data']) && count($resNoClassList['json']['data']) === 0 && ($resNoClassList['json']['meta']['total'] ?? null) === 0
    );

    $resNoClassSched = apiRequest('GET', '/api/student/schedule', $tokenNoClass);
    assertTest(
        'A2. Student with no class -> GET /api/student/schedule (empty 200)',
        200,
        $resNoClassSched['status'],
        isset($resNoClassSched['json']['data']) && count($resNoClassSched['json']['data']) === 0
    );
}

// B. Student cannot check into unrelated class (ISS-003)
// Class 2 is 'Demo Kelas N5 Sore' which Student A has no prior attendance/permissions for
$unrelatedClass = ProgramClass::where('id', '!=', 1)->first();
$resCheckInUnrelated = apiRequest('POST', '/api/student/attendance/check-in', $tokenStudentA, [
    'class_id' => $unrelatedClass->id,
    'notes'    => 'Mencoba absensi kelas yang tidak sah'
]);
assertTest('B. Student cannot check into unrelated class (Fail-Closed)', 403, $resCheckInUnrelated['status']);

// C. Student cannot create permission for unrelated class (ISS-004)
$resPermUnrelated = apiRequest('POST', '/api/student/permissions', $tokenStudentA, [
    'class_id'   => $unrelatedClass->id,
    'type'       => 'izin',
    'start_date' => '2026-11-01',
    'end_date'   => '2026-11-02',
    'reason'     => 'Mengajukan izin untuk kelas yang bukan miliknya',
]);
assertTest('C. Student cannot create permission for unrelated class (Fail-Closed)', 403, $resPermUnrelated['status']);

// D. Student can still access valid existing records where relationship is provable
$resProvableClasses = apiRequest('GET', '/api/student/classes', $tokenStudentA);
assertTest(
    'D1. Student can access provable classes list',
    200,
    $resProvableClasses['status'],
    isset($resProvableClasses['json']['data']) && count($resProvableClasses['json']['data']) > 0
);

$resProvableClassDetail = apiRequest('GET', '/api/student/classes/1', $tokenStudentA);
assertTest(
    'D2. Student can access provable class detail (Class #1)',
    200,
    $resProvableClassDetail['status'],
    ($resProvableClassDetail['json']['data']['id'] ?? null) === 1
);

$resProvableSchedule = apiRequest('GET', '/api/student/schedule', $tokenStudentA);
assertTest(
    'D3. Student can access provable schedule',
    200,
    $resProvableSchedule['status'],
    isset($resProvableSchedule['json']['data']) && count($resProvableSchedule['json']['data']) > 0
);

// F. Student registration response does NOT expose adminNotes (ISS-006)
$resStudentRegList = apiRequest('GET', '/api/student/registrations', $tokenStudentA);
$firstRegItem = $resStudentRegList['json']['data'][0] ?? [];
$studentRegListHidesNotes = !array_key_exists('adminNotes', $firstRegItem);

$resStudentRegDetail = apiRequest('GET', '/api/student/registrations/5', $tokenStudentA);
$studentRegDetailHidesNotes = !array_key_exists('adminNotes', $resStudentRegDetail['json']['data'] ?? []);

assertTest('F1. Student registration list does NOT expose adminNotes', 200, $resStudentRegList['status'], $studentRegListHidesNotes);
assertTest('F2. Student registration detail does NOT expose adminNotes', 200, $resStudentRegDetail['status'], $studentRegDetailHidesNotes);

// Verify Admin API CAN still view adminNotes
$resAdminRegDetail = apiRequest('GET', '/api/admin/registrations/5', $tokenAdmin);
$adminSeesNotes = array_key_exists('adminNotes', $resAdminRegDetail['json']['data'] ?? []);
assertTest('F3. Admin registration detail PRESERVES adminNotes', 200, $resAdminRegDetail['status'], $adminSeesNotes);

// G. Canonical Teacher permission review route works (ISS-007)
// E. Multi-day approved permission generates attendance for every day in interval (ISS-005)
DB::beginTransaction();
try {
    $tempPerm = PermissionRequest::create([
        'user_id'    => $studentA->id,
        'class_id'   => 1,
        'type'       => 'izin',
        'start_date' => '2026-11-10',
        'end_date'   => '2026-11-12', // 3 days: 10, 11, 12
        'reason'     => 'Izin urusan keluarga 3 hari',
        'status'     => 'pending',
    ]);

    $resCanonicalReview = apiRequest('PATCH', "/api/teacher/permissions/{$tempPerm->id}/review", $tokenTeacherA, [
        'status'       => 'approved',
        'review_notes' => 'Disetujui untuk 3 hari penuh.',
    ]);

    assertTest(
        'G. Teacher review endpoint canonical /review works',
        200,
        $resCanonicalReview['status'],
        ($resCanonicalReview['json']['data']['status'] ?? null) === 'approved'
    );

    $attDay1 = Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '2026-11-10')->first();
    $attDay2 = Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '2026-11-11')->first();
    $attDay3 = Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '2026-11-12')->first();

    $multiDaySuccess = ($attDay1 && $attDay2 && $attDay3 && $attDay1->status === 'izin' && $attDay2->status === 'izin' && $attDay3->status === 'izin');

    assertTest('E. Multi-day approved permission generates attendance for every date in range', 200, $resCanonicalReview['status'], $multiDaySuccess);
} finally {
    DB::rollBack();
}

// H. ClassResource fallback from class_name to name (ISS-008)
$fakeClass = new ProgramClass([
    'name'       => 'Kelas Fallback Uji Coba',
    'class_name' => null,
    'program_id' => 1,
]);
$fakeClass->id = 777;
$reqMock = Request::create('/api/classes', 'GET');
$resourceData = (new \App\Http\Resources\ClassResource($fakeClass))->toArray($reqMock);
$fallbackSuccess = ($resourceData['className'] === 'Kelas Fallback Uji Coba');
assertTest('H. ClassResource className correctly falls back to name', 200, 200, $fallbackSuccess);

// -------------------------
// GROUP 7: FIX-B CLASS ENROLLMENT ARCHITECTURE TESTS (1-26)
// -------------------------
echo "\n--- GROUP 7: FIX-B CLASS ENROLLMENT ARCHITECTURE (MANDATORY 26 TESTS) ---\n";

$studentNew = User::where('role', 'SISWA')->whereNotIn('id', [$studentA->id, $studentB->id])->first();
$tokenStudentNew = $studentNew->createToken('test-student-new')->plainTextToken;

$createdEnrollmentId = null;
$createdAttendanceId = null;
$createdPermissionId = null;

try {
    // 1. ADMIN dapat membuat enrollment siswa ke class.
    $resB1 = apiRequest('POST', '/api/admin/enrollments', $tokenAdmin, [
        'user_id'     => $studentNew->id,
        'class_id'    => 2,
        'status'      => 'ACTIVE',
        'enrolled_at' => now()->format('Y-m-d H:i:s'),
    ]);
    $createdEnrollmentId = $resB1['json']['data']['id'] ?? null;
    assertTest('B1. ADMIN can create student enrollment to class', 201, $resB1['status'], $createdEnrollmentId !== null);

    // 2. Enrollment student dengan role ADMIN ditolak.
    $resB2 = apiRequest('POST', '/api/admin/enrollments', $tokenAdmin, [
        'user_id'  => $admin->id,
        'class_id' => 2,
    ]);
    assertTest('B2. Enrollment for user with role ADMIN rejected', 422, $resB2['status']);

    // 3. Enrollment student dengan role PENGAJAR ditolak.
    $resB3 = apiRequest('POST', '/api/admin/enrollments', $tokenAdmin, [
        'user_id'  => $teacherA->id,
        'class_id' => 2,
    ]);
    assertTest('B3. Enrollment for user with role PENGAJAR rejected', 422, $resB3['status']);

    // 4. Student tidak dapat membuat enrollment dirinya sendiri.
    $resB4 = apiRequest('POST', '/api/admin/enrollments', $tokenStudentNew, [
        'user_id'  => $studentNew->id,
        'class_id' => 2,
    ]);
    assertTest('B4. Student cannot self-enroll via admin endpoint', 403, $resB4['status']);

    // 5. Student tidak dapat membuat enrollment untuk student lain.
    $resB5 = apiRequest('POST', '/api/admin/enrollments', $tokenStudentA, [
        'user_id'  => $studentNew->id,
        'class_id' => 2,
    ]);
    assertTest('B5. Student cannot enroll other students', 403, $resB5['status']);

    // 6. Teacher tidak dapat membuat enrollment.
    $resB6 = apiRequest('POST', '/api/admin/enrollments', $tokenTeacherA, [
        'user_id'  => $studentNew->id,
        'class_id' => 3,
    ]);
    assertTest('B6. Teacher cannot create enrollments', 403, $resB6['status']);

    // 7. Duplicate ACTIVE enrollment ditolak.
    $resB7 = apiRequest('POST', '/api/admin/enrollments', $tokenAdmin, [
        'user_id'  => $studentNew->id,
        'class_id' => 2,
        'status'   => 'ACTIVE',
    ]);
    assertTest('B7. Duplicate ACTIVE enrollment rejected', 422, $resB7['status']);

    // 8. Student dapat melihat class setelah active enrollment dibuat.
    $resB8 = apiRequest('GET', '/api/student/classes/2', $tokenStudentNew);
    assertTest('B8. Student can view class after active enrollment created', 200, $resB8['status'], ($resB8['json']['data']['id'] ?? null) === 2);

    // 9. Student tanpa enrollment tidak dapat melihat class tersebut.
    $resB9 = apiRequest('GET', '/api/student/classes/3', $tokenStudentNew);
    assertTest('B9. Student without enrollment cannot view class', 403, $resB9['status']);

    // 10. Student tanpa enrollment tidak dapat check-in.
    $resB10 = apiRequest('POST', '/api/student/attendance/check-in', $tokenStudentNew, [
        'class_id' => 3,
        'notes'    => 'Mencoba presensi kelas tanpa enrollment',
    ]);
    assertTest('B10. Student without enrollment cannot check in', 403, $resB10['status']);

    // 11. Student tanpa enrollment tidak dapat membuat permission.
    $resB11 = apiRequest('POST', '/api/student/permissions', $tokenStudentNew, [
        'class_id'   => 3,
        'type'       => 'izin',
        'start_date' => '2026-11-20',
        'end_date'   => '2026-11-20',
        'reason'     => 'Izin tanpa enrollment',
    ]);
    assertTest('B11. Student without enrollment cannot create permission', 403, $resB11['status']);

    // 12. Student dengan active enrollment dapat check-in.
    $resB12 = apiRequest('POST', '/api/student/attendance/check-in', $tokenStudentNew, [
        'class_id' => 2,
        'notes'    => 'Presensi mandiri siswa baru enrolled',
    ]);
    $createdAttendanceId = $resB12['json']['data']['id'] ?? null;
    assertTest('B12. Student with active enrollment can check in', 201, $resB12['status']);

    // 13. Student dengan active enrollment dapat membuat permission.
    $resB13 = apiRequest('POST', '/api/student/permissions', $tokenStudentNew, [
        'class_id'   => 2,
        'type'       => 'izin',
        'start_date' => '2026-11-25',
        'end_date'   => '2026-11-25',
        'reason'     => 'Izin urusan keluarga',
    ]);
    $createdPermissionId = $resB13['json']['data']['id'] ?? null;
    assertTest('B13. Student with active enrollment can create permission', 201, $resB13['status']);

    // 14. Teacher dapat melihat student melalui active enrollment.
    $resB14 = apiRequest('GET', '/api/teacher/classes/2/students', $tokenTeacherA);
    $studentsInClass2 = collect($resB14['json']['data']['students'] ?? [])->pluck('id');
    assertTest('B14. Teacher can see student in class roster via active enrollment', 200, $resB14['status'], $studentsInClass2->contains($studentNew->id));

    // 15. Teacher dari class lain tidak dapat melihat student tersebut.
    $resB15 = apiRequest('GET', '/api/teacher/classes/2/students', $tokenTeacherB);
    assertTest('B15. Teacher of another class cannot view class roster', 403, $resB15['status']);

    // 16. Teacher hanya dapat mengelola attendance student yang enrolled.
    $resB16 = apiRequest('POST', '/api/teacher/attendance', $tokenTeacherA, [
        'class_id'        => 3,
        'user_id'         => $studentNew->id,
        'attendance_date' => '2026-11-01',
        'status'          => 'hadir',
    ]);
    assertTest('B16. Teacher cannot record attendance for non-enrolled student', 422, $resB16['status']);

    // 17. Enrollment status COMPLETED tidak memberikan akses aktif ke class.
    $resB17a = apiRequest('PATCH', "/api/admin/enrollments/{$createdEnrollmentId}", $tokenAdmin, [
        'status' => 'COMPLETED',
    ]);
    $resB17b = apiRequest('GET', '/api/student/classes/2', $tokenStudentNew);
    assertTest('B17. COMPLETED enrollment revokes active class access', 403, $resB17b['status']);

    // 18. Enrollment status CANCELLED tidak memberikan akses aktif ke class.
    $resB18a = apiRequest('PATCH', "/api/admin/enrollments/{$createdEnrollmentId}", $tokenAdmin, [
        'status' => 'CANCELLED',
    ]);
    $resB18b = apiRequest('GET', '/api/student/classes/2', $tokenStudentNew);
    assertTest('B18. CANCELLED enrollment revokes active class access', 403, $resB18b['status']);

    // 19. Historical enrollment tidak memberikan akses aktif jika sudah ended.
    $resB19 = apiRequest('GET', '/api/student/schedule', $tokenStudentNew);
    $schedClassIds = collect($resB19['json']['data'] ?? [])->pluck('classId');
    assertTest('B19. Historical ended enrollment does not appear in active schedule', 200, $resB19['status'], !$schedClassIds->contains(2));

    // 20. Existing attendance tidak rusak.
    $attCount = Attendance::whereIn('id', [1, 2, 3, 4, 5])->count();
    assertTest('B20. Existing attendance records preserved', 5, $attCount);

    // 21. Existing permission tidak rusak.
    $permCount = PermissionRequest::whereIn('id', [1, 2, 3, 4])->count();
    assertTest('B21. Existing permission records preserved', 4, $permCount);

    // 22. Existing registrations tidak rusak.
    $regCount = Registration::whereIn('id', [1, 2, 3, 4, 5])->count();
    assertTest('B22. Existing registration records preserved', 5, $regCount);

    // 23. Multi-day permission Fix-A tetap berfungsi.
    $tempPermB = PermissionRequest::create([
        'user_id'    => $studentA->id,
        'class_id'   => 1,
        'type'       => 'izin',
        'start_date' => '2026-12-01',
        'end_date'   => '2026-12-03', // 3 days
        'reason'     => 'Izin multi-day test Fix-B',
        'status'     => 'pending',
    ]);
    $resB23 = apiRequest('PATCH', "/api/teacher/permissions/{$tempPermB->id}/review", $tokenTeacherA, [
        'status'       => 'approved',
        'review_notes' => 'Disetujui 3 hari',
    ]);
    $att1 = Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '2026-12-01')->first();
    $att2 = Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '2026-12-02')->first();
    $att3 = Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '2026-12-03')->first();
    $multiDayOk = ($att1 && $att2 && $att3 && $att1->status === 'izin' && $att2->status === 'izin' && $att3->status === 'izin');
    assertTest('B23. Multi-day permission Fix-A works correctly with enrollment', 200, $resB23['status'], $multiDayOk);
    Attendance::where('user_id', $studentA->id)->where('class_id', 1)->whereDate('attendance_date', '>=', '2026-12-01')->whereDate('attendance_date', '<=', '2026-12-03')->delete();
    $tempPermB->delete();

    // 24. Admin tetap dapat melihat adminNotes.
    $resB24 = apiRequest('GET', '/api/admin/registrations/5', $tokenAdmin);
    $adminHasNotes = array_key_exists('adminNotes', $resB24['json']['data'] ?? []);
    assertTest('B24. Admin can view adminNotes', 200, $resB24['status'], $adminHasNotes);

    // 25. Student tetap tidak dapat melihat adminNotes.
    $resB25 = apiRequest('GET', '/api/student/registrations/5', $tokenStudentA);
    $studentHidesNotes = !array_key_exists('adminNotes', $resB25['json']['data'] ?? []);
    assertTest('B25. Student cannot view adminNotes', 200, $resB25['status'], $studentHidesNotes);

    // 26. IDOR protection tetap PASS.
    $resB26a = apiRequest('GET', '/api/student/enrollments/1', $tokenStudentA);
    $idorStudentPass = ($resB26a['status'] === 403);
    $resB26b = apiRequest('GET', '/api/teacher/classes/1/attendance', $tokenTeacherB);
    $idorTeacherPass = ($resB26b['status'] === 403);
    assertTest('B26. IDOR protection remains intact across Student & Teacher APIs', 200, 200, $idorStudentPass && $idorTeacherPass);

} finally {
    if ($createdAttendanceId) {
        Attendance::where('id', $createdAttendanceId)->delete();
    }
    if ($createdPermissionId) {
        PermissionRequest::where('id', $createdPermissionId)->delete();
    }
    if ($createdEnrollmentId) {
        Enrollment::where('id', $createdEnrollmentId)->delete();
    }
}

// Summary
echo "\n========================================\n";
echo "TEST RESULTS: {$passed} PASSED, {$failed} FAILED\n";
echo "========================================\n";

if ($failed > 0) {
    exit(1);
}
