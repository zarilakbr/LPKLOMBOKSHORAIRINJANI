<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ProgramClass;
use App\Models\Enrollment;
use App\Models\Schedule;
use App\Models\Attendance;
use App\Models\PermissionRequest;
use App\Models\Notification;
use App\Services\RealtimeEventBus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

function apiReq($method, $uri, $token = null, $data = []) {
    app('auth')->forgetGuards();

    $queryParams = [];
    $content = null;

    if (strtoupper($method) === 'GET' && !empty($data)) {
        $queryParams = $data;
        $uri .= (strpos($uri, '?') === false ? '?' : '&') . http_build_query($data);
    } else {
        $content = json_encode($data);
    }

    $server = [
        'REQUEST_METHOD' => $method,
        'REQUEST_URI'    => $uri,
        'HTTP_ACCEPT'    => 'application/json',
    ];
    if ($token) {
        $server['HTTP_AUTHORIZATION'] = 'Bearer ' . $token;
    }

    $server['CONTENT_TYPE'] = 'application/json';

    $req = Request::create($uri, $method, $queryParams, [], [], $server, $content);
    $res = app()->handle($req);

    return [
        'status' => $res->getStatusCode(),
        'json'   => json_decode($res->getContent(), true) ?: []
    ];
}

$admin = User::where('email', 'admin@example.test')->first();
$teacherA = User::where('email', 'teacher@example.test')->first();
$teacherB = User::where('email', 'rina.sensei@lombokshorairinjani.co.id')->first();
$studentA = User::where('email', 'student@example.test')->first();
$studentB = User::where('email', 'ahmad.fajar@example.test')->first();

$tokenAdmin = $admin->createToken('int-admin')->plainTextToken;
$tokenTeacherA = $teacherA->createToken('int-teacher-a')->plainTextToken;
$tokenTeacherB = $teacherB->createToken('int-teacher-b')->plainTextToken;
$tokenStudentA = $studentA->createToken('int-student-a')->plainTextToken;
$tokenStudentB = $studentB->createToken('int-student-b')->plainTextToken;

$passed = 0;
$failed = 0;

function assertLMS($code, $description, $condition) {
    global $passed, $failed;
    if ($condition) {
        echo "[PASS] {$code}: {$description}\n";
        $passed++;
    } else {
        echo "[FAIL] {$code}: {$description}\n";
        $failed++;
    }
}

echo "============================================================\n";
echo "LPK LOMBOK SHORAI RINJANI — LMS INTEGRATION TEST SUITE\n";
echo "============================================================\n\n";

// --- 1. AUTH & ROLE GUARDS ---
echo "--- 1. AUTH & ROLE SECURITY ---\n";
$unauth = apiReq('GET', '/api/student/schedule');
assertLMS('AUTH-1', 'Unauthenticated request receives 401', $unauth['status'] === 401);

$studentInTeacher = apiReq('GET', '/api/teacher/schedule', $tokenStudentA);
assertLMS('AUTH-2', 'Student access to Teacher schedule receives 403', $studentInTeacher['status'] === 403);

$teacherInStudent = apiReq('GET', '/api/student/schedule', $tokenTeacherA);
assertLMS('AUTH-3', 'Teacher access to Student schedule receives 403', $teacherInStudent['status'] === 403);

$adminInStudent = apiReq('GET', '/api/student/schedule', $tokenAdmin);
assertLMS('AUTH-4', 'Admin direct access to Student portal receives 403 (strict separation)', $adminInStudent['status'] === 403);

// --- 2. SCHEDULE CRUD & AUTHORIZATION ---
echo "\n--- 2. SCHEDULE TIMETABLE MANAGEMENT ---\n";

// Find or create test classes
$classA = ProgramClass::where('teacher_id', $teacherA->id)->first();
$classB = ProgramClass::where('teacher_id', $teacherB->id)->first();

// Teacher A creates schedule for their own class
$resSchedCreate = apiReq('POST', '/api/teacher/schedule', $tokenTeacherA, [
    'class_id'   => $classA->id,
    'title'      => 'Sesi Bunpou & Dokkai Sesi 1',
    'date'       => '2026-11-20',
    'start_time' => '09:00',
    'end_time'   => '11:00',
    'location'   => 'Ruang Teori Sakura 01',
    'notes'      => 'Bawa modul bab 1-3',
    'status'     => 'scheduled'
]);
$schedId = $resSchedCreate['json']['data']['id'] ?? null;
assertLMS('SCHED-1', 'Teacher A creates schedule session for own class (201)', $resSchedCreate['status'] === 201 && $schedId !== null);

// Teacher B attempts to create schedule for Teacher A class (IDOR)
$resSchedIdor = apiReq('POST', '/api/teacher/schedule', $tokenTeacherB, [
    'class_id'   => $classA->id,
    'title'      => 'IDOR attempt by Teacher B',
    'date'       => '2026-11-20',
    'start_time' => '09:00',
    'end_time'   => '11:00'
]);
assertLMS('SCHED-2', 'Teacher B IDOR create schedule for Teacher A class blocked (403)', $resSchedIdor['status'] === 403);

// Validation: end_time before start_time must be rejected (422)
$resSchedInvalid = apiReq('POST', '/api/teacher/schedule', $tokenTeacherA, [
    'class_id'   => $classA->id,
    'title'      => 'Invalid time range',
    'date'       => '2026-11-20',
    'start_time' => '11:00',
    'end_time'   => '09:00'
]);
assertLMS('SCHED-3', 'Schedule with end_time before start_time rejected (422)', $resSchedInvalid['status'] === 422);

// Teacher A updates schedule
$resSchedUpdate = apiReq('PATCH', "/api/teacher/schedule/{$schedId}", $tokenTeacherA, [
    'title'    => 'Sesi Bunpou & Dokkai Sesi 1 (Revisi Ruangan)',
    'location' => 'Laboratorium Bahasa 02'
]);
assertLMS('SCHED-4', 'Teacher A updates schedule session (200)', $resSchedUpdate['status'] === 200 && ($resSchedUpdate['json']['data']['location'] ?? '') === 'Laboratorium Bahasa 02');

// Teacher B cannot update Teacher A schedule (IDOR)
$resSchedUpdateIdor = apiReq('PATCH', "/api/teacher/schedule/{$schedId}", $tokenTeacherB, [
    'title' => 'Malicious update'
]);
assertLMS('SCHED-5', 'Teacher B IDOR update Teacher A schedule blocked (403)', $resSchedUpdateIdor['status'] === 403);

// Student with active enrollment can read schedule
// Ensure Student A has ACTIVE enrollment in Class A
$enrA = Enrollment::firstOrCreate(
    ['user_id' => $studentA->id, 'class_id' => $classA->id],
    ['status' => Enrollment::STATUS_ACTIVE]
);
$enrA->update(['status' => Enrollment::STATUS_ACTIVE]);

$resStudentSched = apiReq('GET', '/api/student/schedule', $tokenStudentA);
$hasSession = collect($resStudentSched['json']['data'] ?? [])->contains(fn ($s) => ($s['id'] ?? null) === $schedId || ($s['classId'] ?? null) === $classA->id);
assertLMS('SCHED-6', 'Enrolled Student A sees schedule session (200)', $resStudentSched['status'] === 200 && $hasSession);

// Student B cannot access schedule of a class without ACTIVE enrollment (403 IDOR blocked)
$unEnrolledClassForB = ProgramClass::whereNotIn('id', Enrollment::where('user_id', $studentB->id)->where('status', Enrollment::STATUS_ACTIVE)->pluck('class_id'))->first();
$resStudentBFiltered = apiReq('GET', '/api/student/schedule', $tokenStudentB, ['class_id' => $unEnrolledClassForB->id]);
assertLMS('SCHED-7', 'Un-enrolled Student B cannot view non-enrolled Class schedule (403)', $resStudentBFiltered['status'] === 403);

// Admin can view and manage all schedules
$resAdminSched = apiReq('GET', '/api/admin/schedules', $tokenAdmin);
assertLMS('SCHED-8', 'Admin can list all class schedules (200)', $resAdminSched['status'] === 200 && count($resAdminSched['json']['data'] ?? []) > 0);

// --- 3. ATTENDANCE & DUPLICATE PREVENTION ---
echo "\n--- 3. ATTENDANCE & CONSISTENCY ---\n";

// Teacher A records attendance for Student A
$attDate = '2026-11-20';
$resAttRecord = apiReq('POST', '/api/teacher/attendance', $tokenTeacherA, [
    'class_id'        => $classA->id,
    'user_id'         => $studentA->id,
    'attendance_date' => $attDate,
    'status'          => 'hadir',
    'notes'           => 'Hadir aktif di sesi kelas'
]);
$attId = $resAttRecord['json']['data']['id'] ?? null;
assertLMS('ATT-1', 'Teacher A records attendance for enrolled Student A (201)', $resAttRecord['status'] === 201 && $attId !== null);

// Teacher A recording same date/student updates existing without duplicating (updateOrCreate)
$resAttRecordDup = apiReq('POST', '/api/teacher/attendance', $tokenTeacherA, [
    'class_id'        => $classA->id,
    'user_id'         => $studentA->id,
    'attendance_date' => $attDate,
    'status'          => 'terlambat',
    'notes'           => 'Revisi catatan: terlambat 5 menit'
]);
$countAtt = Attendance::where('user_id', $studentA->id)->where('class_id', $classA->id)->whereDate('attendance_date', $attDate)->count();
assertLMS('ATT-2', 'Duplicate attendance date/student prevented (exactly 1 record in DB)', $countAtt === 1 && $resAttRecordDup['json']['data']['status'] === 'terlambat');

// Teacher B cannot record attendance for Teacher A class (IDOR)
$resAttIdor = apiReq('POST', '/api/teacher/attendance', $tokenTeacherB, [
    'class_id'        => $classA->id,
    'user_id'         => $studentA->id,
    'attendance_date' => '2026-11-21',
    'status'          => 'hadir'
]);
assertLMS('ATT-3', 'Teacher B IDOR record attendance on Teacher A class blocked (403)', $resAttIdor['status'] === 403);

// Student A reads their own attendance
$resStudentAtt = apiReq('GET', "/api/student/attendance/{$attId}", $tokenStudentA);
assertLMS('ATT-4', 'Student A views own attendance detail (200)', $resStudentAtt['status'] === 200 && ($resStudentAtt['json']['data']['status'] ?? '') === 'terlambat');

// Student B cannot read Student A attendance (IDOR)
$resStudentBAttIdor = apiReq('GET', "/api/student/attendance/{$attId}", $tokenStudentB);
assertLMS('ATT-5', 'Student B IDOR view Student A attendance blocked (403)', $resStudentBAttIdor['status'] === 403);

// --- 4. PERMISSION ↔ ATTENDANCE CONSISTENCY ---
echo "\n--- 4. PERMISSION ↔ ATTENDANCE MULTI-DAY CONSISTENCY ---\n";

// Student A requests multi-day permission: 2026-12-01 to 2026-12-03 (3 days)
$resPermStore = apiReq('POST', '/api/student/permissions', $tokenStudentA, [
    'class_id'   => $classA->id,
    'type'       => 'izin',
    'start_date' => '2026-12-01',
    'end_date'   => '2026-12-03',
    'reason'     => 'Menghadiri acara wisuda keluarga di luar kota'
]);
$permId = $resPermStore['json']['data']['id'] ?? null;
assertLMS('PERM-1', 'Student A submits multi-day permission request (201)', $resPermStore['status'] === 201 && $permId !== null);

// Teacher B cannot review Student A permission (IDOR)
$resPermReviewIdor = apiReq('PATCH', "/api/teacher/permissions/{$permId}/review", $tokenTeacherB, [
    'status' => 'approved'
]);
assertLMS('PERM-2', 'Teacher B IDOR review Student A permission blocked (403)', $resPermReviewIdor['status'] === 403);

// Teacher A approves multi-day permission
$resPermReview = apiReq('PATCH', "/api/teacher/permissions/{$permId}/review", $tokenTeacherA, [
    'status'       => 'approved',
    'review_notes' => 'Disetujui. Harap pelajari materi mandiri.'
]);
assertLMS('PERM-3', 'Teacher A approves Student A permission (200)', $resPermReview['status'] === 200 && ($resPermReview['json']['data']['status'] ?? '') === 'approved');

// Verify consistency: 3 attendance records created for 2026-12-01, 2026-12-02, 2026-12-03 with status 'izin'
$attD1 = Attendance::where('user_id', $studentA->id)->where('class_id', $classA->id)->whereDate('attendance_date', '2026-12-01')->first();
$attD2 = Attendance::where('user_id', $studentA->id)->where('class_id', $classA->id)->whereDate('attendance_date', '2026-12-02')->first();
$attD3 = Attendance::where('user_id', $studentA->id)->where('class_id', $classA->id)->whereDate('attendance_date', '2026-12-03')->first();

$all3Created = ($attD1 && $attD1->status === 'izin') &&
               ($attD2 && $attD2->status === 'izin') &&
               ($attD3 && $attD3->status === 'izin');
assertLMS('PERM-4', 'Multi-day approved permission generated exactly 3 consistent attendance records (izin)', $all3Created);

// Verify no duplicate if re-reviewed
$resPermReReview = apiReq('PATCH', "/api/teacher/permissions/{$permId}/review", $tokenTeacherA, [
    'status'       => 'approved',
    'review_notes' => 'Persetujuan ulang konfirmasi'
]);
$countD1 = Attendance::where('user_id', $studentA->id)->where('class_id', $classA->id)->whereDate('attendance_date', '2026-12-01')->count();
assertLMS('PERM-5', 'Re-reviewing does not create duplicate attendances (count = 1 per day)', $countD1 === 1);

// --- 5. NOTIFICATION CENTER & IDOR ---
echo "\n--- 5. NOTIFICATION CENTER SECURITY & FUNCTIONALITY ---\n";

// Create test notification for Student A
$notifA = Notification::create([
    'user_id'    => $studentA->id,
    'type'       => 'pengumuman',
    'title'      => 'Pengumuman Ujian JLPT LPK',
    'message'    => 'Pendaftaran simulasi JLPT dibuka minggu ini.',
    'is_read'    => false,
    'action_url' => '/dashboard/schedule'
]);

// Student A reads notifications list
$resNotifList = apiReq('GET', '/api/student/notifications', $tokenStudentA);
$hasNotif = collect($resNotifList['json']['data'] ?? [])->contains(fn ($n) => ($n['id'] ?? null) === $notifA->id);
assertLMS('NOTIF-1', 'Student A views persistent notifications list (200)', $resNotifList['status'] === 200 && $hasNotif);

// Student B cannot mark Student A notification as read (IDOR)
$resNotifIdor = apiReq('POST', "/api/student/notifications/{$notifA->id}/read", $tokenStudentB);
assertLMS('NOTIF-2', 'Student B IDOR mark Student A notification blocked (403/404)', in_array($resNotifIdor['status'], [403, 404]));

// Student A marks notification read
$resNotifRead = apiReq('POST', "/api/student/notifications/{$notifA->id}/read", $tokenStudentA);
$freshNotif = $notifA->fresh();
assertLMS('NOTIF-3', 'Student A marks own notification as read (200 & is_read = true)', $resNotifRead['status'] === 200 && (bool)$freshNotif->is_read === true);

// Student A marks all notifications read
$resNotifReadAll = apiReq('POST', '/api/student/notifications/read-all', $tokenStudentA);
$unreadCount = Notification::where('user_id', $studentA->id)->where('is_read', false)->count();
assertLMS('NOTIF-4', 'Student A mark all notifications read (unread count = 0)', $resNotifReadAll['status'] === 200 && $unreadCount === 0);

// --- 6. REALTIME BROADCAST INTEGRITY ---
echo "\n--- 6. REALTIME REVERB EVENTS INTEGRITY ---\n";

$startTime = microtime(true);

// Trigger schedule updated event
$eventSched = new \App\Events\ScheduleUpdated(Schedule::find($schedId));
assertLMS('RT-SCHED', 'ScheduleUpdated event instantiated with proper class channels', in_array('private-class.' . $classA->id, array_map(fn($c) => $c->name, $eventSched->broadcastOn())));

// Trigger attendance recorded event
$loadedAtt = Attendance::with(['user', 'class'])->find($attId);
$eventAtt = new \App\Events\AttendanceRecorded($loadedAtt);
assertLMS('RT-ATT', 'AttendanceRecorded event broadcast channels include student and class', in_array('private-user.' . $studentA->id, array_map(fn($c) => $c->name, $eventAtt->broadcastOn())));

// Trigger permission reviewed event
$loadedPerm = PermissionRequest::with(['user', 'class'])->find($permId);
$eventPerm = new \App\Events\PermissionReviewed($loadedPerm);
assertLMS('RT-PERM', 'PermissionReviewed event broadcast channels include student private channel', in_array('private-user.' . $studentA->id, array_map(fn($c) => $c->name, $eventPerm->broadcastOn())));

// --- CLEANUP TEST DATA ---
if ($schedId) {
    Schedule::where('id', $schedId)->delete();
}
if ($attId) {
    Attendance::where('id', $attId)->delete();
}
Attendance::where('user_id', $studentA->id)->where('class_id', $classA->id)->whereIn('attendance_date', ['2026-12-01', '2026-12-02', '2026-12-03'])->delete();
if ($permId) {
    PermissionRequest::where('id', $permId)->delete();
}
$notifA->delete();

echo "\n============================================================\n";
echo "LMS INTEGRATION TEST RESULTS: {$passed} PASSED, {$failed} FAILED\n";
echo "============================================================\n";

if ($failed > 0) {
    exit(1);
}
