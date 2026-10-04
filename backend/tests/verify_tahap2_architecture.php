<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Program;
use App\Models\ProgramClass;
use App\Models\Enrollment;
use App\Models\Schedule;
use App\Models\ActivityLog;
use App\Http\Controllers\Api\Teacher\TeacherClassController;
use App\Http\Controllers\Api\Admin\AdminClassController;
use App\Http\Controllers\Api\Student\StudentClassController;
use App\Http\Requests\Teacher\StoreTeacherClassRequest;
use App\Http\Requests\Teacher\UpdateTeacherClassRequest;
use App\Http\Requests\StoreClassRequest;
use App\Http\Requests\StoreScheduleRequest;
use App\Events\ClassCreated;
use App\Events\ClassUpdated;
use App\Events\ClassDeleted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Validator;

echo "====================================================================\n";
echo " TAHAP 2: ARCHITECTURE & IDOR SECURITY VERIFICATION SUITE\n";
echo " Single Source of Truth: Admin -> Pengajar -> Kelas -> Siswa -> Sesi\n";
echo "====================================================================\n\n";

$passCount = 0;
$failCount = 0;

function assertTest(bool $condition, string $message): void {
    global $passCount, $failCount;
    if ($condition) {
        echo "[PASS] $message\n";
        $passCount++;
    } else {
        echo "[FAIL] $message\n";
        $failCount++;
    }
}

// 1. Locate Users in Database
$admin = User::where('role', User::ROLE_ADMIN)->first();
$teachers = User::where('role', User::ROLE_PENGAJAR)->where('status', User::STATUS_ACTIVE)->take(2)->get();
$student = User::where('role', User::ROLE_SISWA)->where('status', User::STATUS_ACTIVE)->first();
$program = Program::first();

assertTest($admin !== null, "Admin user exists in database (ID: " . ($admin?->id ?? 'none') . ")");
assertTest($teachers->count() >= 2, "At least 2 active PENGAJAR users exist in database (Found: {$teachers->count()})");
assertTest($student !== null, "Student user exists in database (ID: " . ($student?->id ?? 'none') . ")");
assertTest($program !== null, "Program exists in database (ID: " . ($program?->id ?? 'none') . ")");

if ($teachers->count() < 2 || !$admin || !$student || !$program) {
    echo "Aborting tests due to insufficient baseline database records.\n";
    exit(1);
}

$teacherA = $teachers[0];
$teacherB = $teachers[1];

echo "\nTest Actors:\n";
echo " - Admin:     {$admin->name} (ID: {$admin->id})\n";
echo " - Teacher A: {$teacherA->name} (ID: {$teacherA->id})\n";
echo " - Teacher B: {$teacherB->name} (ID: {$teacherB->id})\n";
echo " - Student:   {$student->name} (ID: {$student->id})\n";
echo " - Program:   {$program->title} (ID: {$program->id})\n\n";

$teacherClassController = app(TeacherClassController::class);
$adminClassController = app(AdminClassController::class);
$studentClassController = app(StudentClassController::class);

// -------------------------------------------------------------------------
// TEST GROUP 1: TEACHER A CLASS CREATION & PAYLOAD SPOOFING PROTECTION
// -------------------------------------------------------------------------
echo "--- TEST GROUP 1: Teacher A Class Creation & IDOR Payload Protection ---\n";

$storeRequest = StoreTeacherClassRequest::create('/api/teacher/classes', 'POST', [
    'class_name' => 'Kelas Verifikasi Arsitektur ' . time(),
    'program_id' => $program->id,
    'level' => 'N4 Intermediate',
    'schedule' => 'Senin - Rabu, 09.00 - 12.00 WITA',
    'start_date' => date('Y-m-d'),
    'end_date' => date('Y-m-d', strtotime('+3 months')),
    'capacity' => 25,
    'location' => 'Laboratorium Bahasa 1',
    'status' => 'OPEN',
    'description' => 'Kelas pengujian arsitektur LMS terpadu.',
    'teacher_id' => 9999, // Adversarial payload: try to spoof owner!
]);
$storeRequest->setUserResolver(fn() => $teacherA);

// Validate using FormRequest rules
$validator = Validator::make($storeRequest->all(), $storeRequest->rules());
$storeRequest->setValidator($validator);

$createResponse = $teacherClassController->store($storeRequest);
$createData = json_decode($createResponse->getContent(), true);

assertTest($createResponse->getStatusCode() === 201, "Teacher A creates class returns HTTP 201 Created");
assertTest(isset($createData['data']['id']), "Created class has valid numeric ID");

$classAId = $createData['data']['id'] ?? null;
$classA = ProgramClass::find($classAId);

assertTest($classA !== null, "Class A successfully persisted in PostgreSQL");
assertTest($classA->teacher_id === $teacherA->id, "Class A teacher_id is STRICTLY bound to Teacher A (auth user {$teacherA->id}), payload 9999 was ignored");
assertTest($classA->instructor === $teacherA->name, "Class A instructor is synced to Teacher A name ({$teacherA->name})");

// Verify ClassResource structure
assertTest(isset($createData['data']['teacherId']) && $createData['data']['teacherId'] === $teacherA->id, "ClassResource exposes camelCase teacherId");
assertTest(isset($createData['data']['teacher']['id']) && $createData['data']['teacher']['id'] === $teacherA->id, "ClassResource exposes teacher object with matching ID");

// Verify ActivityLog
$logA = ActivityLog::where('user_id', $teacherA->id)->where('action', 'CREATE')->where('module', 'Classes')->latest()->first();
assertTest($logA !== null && str_contains($logA->description, $classA->class_name), "ActivityLog recorded teacher class creation");

// -------------------------------------------------------------------------
// TEST GROUP 2: TEACHER A SHOW & UPDATE
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 2: Teacher A View & Update Class ---\n";

$showReqA = Request::create("/api/teacher/classes/{$classAId}", 'GET');
$showReqA->setUserResolver(fn() => $teacherA);
$showResA = $teacherClassController->show($showReqA, $classAId);
$showDataA = json_decode($showResA->getContent(), true);

assertTest($showResA->getStatusCode() === 200, "Teacher A can view their own class (HTTP 200)");
assertTest($showDataA['data']['id'] === $classAId, "Returned class ID matches");

// Teacher A updates class
$updateReqA = UpdateTeacherClassRequest::create("/api/teacher/classes/{$classAId}", 'PUT', [
    'class_name' => $classA->class_name . ' [Updated]',
    'schedule' => 'Selasa - Kamis, 13.00 - 16.00 WITA',
    'capacity' => 30,
    'status' => 'ONGOING',
    'teacher_id' => $teacherB->id // Adversarial attempt to transfer ownership
]);
$updateReqA->setUserResolver(fn() => $teacherA);
$valUpdate = Validator::make($updateReqA->all(), $updateReqA->rules());
$updateReqA->setValidator($valUpdate);

$updateResA = $teacherClassController->update($updateReqA, $classAId);
$updateDataA = json_decode($updateResA->getContent(), true);

assertTest($updateResA->getStatusCode() === 200, "Teacher A can update their own class (HTTP 200)");
$classA->refresh();
assertTest($classA->capacity === 30, "Capacity updated to 30");
assertTest($classA->teacher_id === $teacherA->id, "teacher_id remains Teacher A; frontend payload transfer was rejected");

// -------------------------------------------------------------------------
// TEST GROUP 3: TEACHER B IDOR ATTACKS ON TEACHER A'S CLASS
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 3: IDOR Security Tests (Teacher B vs Teacher A) ---\n";

// 3.1 Teacher B attempts to view Teacher A's class
$idorShowReq = Request::create("/api/teacher/classes/{$classAId}", 'GET');
$idorShowReq->setUserResolver(fn() => $teacherB);
$idorShowRes = $teacherClassController->show($idorShowReq, $classAId);

assertTest($idorShowRes->getStatusCode() === 403, "Teacher B CANNOT view Teacher A's class (HTTP 403 Forbidden IDOR protected)");

// 3.2 Teacher B attempts to update Teacher A's class
$idorUpdateReq = UpdateTeacherClassRequest::create("/api/teacher/classes/{$classAId}", 'PUT', [
    'class_name' => 'Hacked by Teacher B',
    'capacity' => 999
]);
$idorUpdateReq->setUserResolver(fn() => $teacherB);
$idorVal = Validator::make($idorUpdateReq->all(), $idorUpdateReq->rules());
$idorUpdateReq->setValidator($idorVal);
$idorUpdateRes = $teacherClassController->update($idorUpdateReq, $classAId);

assertTest($idorUpdateRes->getStatusCode() === 403, "Teacher B CANNOT update Teacher A's class (HTTP 403 Forbidden IDOR protected)");
$classA->refresh();
assertTest($classA->capacity !== 999, "Database record remained untouched by Teacher B");

// 3.3 Teacher B attempts to delete Teacher A's class
$idorDelReq = Request::create("/api/teacher/classes/{$classAId}", 'DELETE');
$idorDelReq->setUserResolver(fn() => $teacherB);
$idorDelRes = $teacherClassController->destroy($idorDelReq, $classAId);

assertTest($idorDelRes->getStatusCode() === 403, "Teacher B CANNOT delete Teacher A's class (HTTP 403 Forbidden IDOR protected)");
assertTest(ProgramClass::find($classAId) !== null, "Class A was NOT deleted by Teacher B");

// 3.4 Teacher B attempts to create Schedule for Teacher A's class
$idorSchedReq = StoreScheduleRequest::create('/api/teacher/schedule', 'POST', [
    'class_id' => $classAId,
    'title' => 'Illegal Session by Teacher B',
    'date' => date('Y-m-d'),
    'start_time' => '10:00',
    'end_time' => '12:00',
    'status' => 'SCHEDULED'
]);
$idorSchedReq->setUserResolver(fn() => $teacherB);
$valSched = Validator::make($idorSchedReq->all(), $idorSchedReq->rules());
$idorSchedReq->setValidator($valSched);
$idorSchedRes = $teacherClassController->storeSchedule($idorSchedReq);

assertTest($idorSchedRes->getStatusCode() === 403, "Teacher B CANNOT create schedule session for Teacher A's class (HTTP 403 IDOR protected)");

// -------------------------------------------------------------------------
// TEST GROUP 4: TEACHER A TEACHING SESSIONS (SCHEDULE)
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 4: Teacher A Teaching Sessions (Schedule Management) ---\n";

$validSchedReq = StoreScheduleRequest::create('/api/teacher/schedule', 'POST', [
    'class_id' => $classAId,
    'title' => 'Pertemuan 1: Orientasi & Bunpou N4',
    'date' => date('Y-m-d', strtotime('+1 day')),
    'start_time' => '08:30',
    'end_time' => '11:30',
    'location' => 'Ruang Teori 1',
    'status' => 'SCHEDULED',
    'notes' => 'Membawa buku Minna no Nihongo II.'
]);
$validSchedReq->setUserResolver(fn() => $teacherA);
$valValidSched = Validator::make($validSchedReq->all(), $validSchedReq->rules());
$validSchedReq->setValidator($valValidSched);

$validSchedRes = $teacherClassController->storeSchedule($validSchedReq);
$validSchedData = json_decode($validSchedRes->getContent(), true);

assertTest($validSchedRes->getStatusCode() === 201, "Teacher A creates schedule session for their class (HTTP 201 Created)");
assertTest(isset($validSchedData['data']['id']), "Schedule session has valid ID");

$schedId = $validSchedData['data']['id'] ?? null;
$createdSched = Schedule::find($schedId);
assertTest($createdSched !== null && $createdSched->class_id === $classAId, "Schedule stored in PostgreSQL linked to Class A");

// -------------------------------------------------------------------------
// TEST GROUP 5: ADMIN CLASS MANAGEMENT & TEACHER ASSIGNMENT
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 5: Admin Class Management & Pengajar Assignment ---\n";

$adminStoreReq = StoreClassRequest::create('/api/admin/classes', 'POST', [
    'class_name' => 'Admin Assigned Class ' . time(),
    'program_id' => $program->id,
    'teacher_id' => $teacherA->id,
    'level' => 'N5 Dasar',
    'schedule' => 'Senin - Jumat, 08.00 - 12.00 WITA',
    'start_date' => date('Y-m-d'),
    'end_date' => date('Y-m-d', strtotime('+3 months')),
    'capacity' => 20,
    'current_students' => 0,
    'location' => 'Ruang Sakura',
    'status' => 'OPEN',
    'description' => 'Dibuat oleh admin dan ditugaskan ke Sensei A.'
]);
$adminStoreReq->setUserResolver(fn() => $admin);
$adminVal = Validator::make($adminStoreReq->all(), $adminStoreReq->rules());
$adminStoreReq->setValidator($adminVal);

$adminStoreRes = $adminClassController->store($adminStoreReq);
$adminStoreData = json_decode($adminStoreRes->getContent(), true);

assertTest($adminStoreRes->getStatusCode() === 201, "Admin creates class with assigned teacher_id returns HTTP 201");
$adminClassId = $adminStoreData['data']['id'] ?? null;
$adminClass = ProgramClass::find($adminClassId);

assertTest($adminClass !== null, "Admin class saved in database");
assertTest($adminClass->teacher_id === $teacherA->id, "Class teacher_id properly references Teacher A (users.id: {$teacherA->id})");
assertTest($adminClass->instructor === $teacherA->name, "Class instructor fallback synchronized with Teacher A name");
assertTest(isset($adminStoreData['data']['teacher']['name']) && $adminStoreData['data']['teacher']['name'] === $teacherA->name, "ClassResource returns teacher relation");

// Admin reassigns class to Teacher B
$adminUpdateReq = StoreClassRequest::create("/api/admin/classes/{$adminClassId}", 'PUT', [
    'class_name' => $adminClass->class_name,
    'program_id' => $program->id,
    'teacher_id' => $teacherB->id, // Reassign to Teacher B
    'level' => 'N5 Dasar',
    'schedule' => 'Senin - Jumat, 08.00 - 12.00 WITA',
    'start_date' => date('Y-m-d'),
    'end_date' => date('Y-m-d', strtotime('+3 months')),
    'capacity' => 20,
    'current_students' => 0,
    'location' => 'Ruang Sakura',
    'status' => 'OPEN'
]);
$adminUpdateReq->setUserResolver(fn() => $admin);
$adminUpVal = Validator::make($adminUpdateReq->all(), $adminUpdateReq->rules());
$adminUpdateReq->setValidator($adminUpVal);

$adminUpdateRes = $adminClassController->update($adminUpdateReq, $adminClassId);
assertTest($adminUpdateRes->getStatusCode() === 200, "Admin reassigns class returns HTTP 200");
$adminClass->refresh();
assertTest($adminClass->teacher_id === $teacherB->id, "Class teacher_id reassigned to Teacher B (users.id: {$teacherB->id})");
assertTest($adminClass->instructor === $teacherB->name, "Class instructor fallback updated to Teacher B name");

// -------------------------------------------------------------------------
// TEST GROUP 6: STUDENT SCOPE & ROLE BOUNDARIES
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 6: Student Enrollment Scope & Role Boundaries ---\n";

// Student index only returns enrolled classes
$studentClassReq = Request::create('/api/student/classes', 'GET');
$studentClassReq->setUserResolver(fn() => $student);
$studentClassRes = $studentClassController->index($studentClassReq);
$studentClassData = json_decode($studentClassRes->getContent(), true);

assertTest($studentClassRes->getStatusCode() === 200, "Student classes endpoint returns HTTP 200");
$enrolledCount = Enrollment::where('user_id', $student->id)->where('status', Enrollment::STATUS_ACTIVE)->count();
$receivedCount = count($studentClassData['data'] ?? []);
assertTest($receivedCount === $enrolledCount, "Student only sees classes where they have an ACTIVE enrollment ({$receivedCount} classes)");

// Unauthenticated requests
$unauthReq = Request::create('/api/teacher/classes', 'GET');
assertTest($unauthReq->user() === null, "Unauthenticated request has no user");

// -------------------------------------------------------------------------
// TEST GROUP 7: REALTIME BROADCAST EVENTS VERIFICATION
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 7: Realtime Event Class Structure ---\n";

$evCreated = new ClassCreated($classA);
$evUpdated = new ClassUpdated($adminClass, $teacherA->id);
$evDeleted = new ClassDeleted($classAId, $teacherA->id, $classA->class_name);

assertTest($evCreated->broadcastAs() === 'class.created', "ClassCreated broadcastAs is 'class.created'");
assertTest($evUpdated->broadcastAs() === 'class.updated', "ClassUpdated broadcastAs is 'class.updated'");
assertTest($evDeleted->broadcastAs() === 'class.deleted', "ClassDeleted broadcastAs is 'class.deleted'");

$channelsCreated = array_map(fn($c) => $c->name, $evCreated->broadcastOn());
assertTest(in_array('private-admin', $channelsCreated), "ClassCreated broadcasts to private-admin");
assertTest(in_array("private-class.{$classA->id}", $channelsCreated), "ClassCreated broadcasts to private-class.{$classA->id}");
assertTest(in_array("private-user.{$teacherA->id}", $channelsCreated), "ClassCreated broadcasts to private-user.{$teacherA->id}");

$channelsUpdated = array_map(fn($c) => $c->name, $evUpdated->broadcastOn());
assertTest(in_array("private-user.{$teacherB->id}", $channelsUpdated), "ClassUpdated broadcasts to new teacher private-user.{$teacherB->id}");
assertTest(in_array("private-user.{$teacherA->id}", $channelsUpdated), "ClassUpdated notifies previous teacher private-user.{$teacherA->id}");

// -------------------------------------------------------------------------
// TEST GROUP 8: CLEANUP TEST-GENERATED CLASSES SAFELY
// -------------------------------------------------------------------------
echo "\n--- TEST GROUP 8: Teacher A Deletes Own Class ---\n";

// Delete schedule first
$createdSched?->delete();

$destroyReqA = Request::create("/api/teacher/classes/{$classAId}", 'DELETE');
$destroyReqA->setUserResolver(fn() => $teacherA);
$destroyResA = $teacherClassController->destroy($destroyReqA, $classAId);

assertTest($destroyResA->getStatusCode() === 200, "Teacher A can delete their own class (HTTP 200)");
assertTest(ProgramClass::find($classAId) === null, "Class A is deleted from database");

// Cleanup admin test class
$adminClass->delete();
assertTest(ProgramClass::find($adminClassId) === null, "Admin test class deleted cleanly without leaving orphan data");

// -------------------------------------------------------------------------
// FINAL SUMMARY
// -------------------------------------------------------------------------
echo "\n====================================================================\n";
echo " TAHAP 2 VERIFICATION SUMMARY\n";
echo " TOTAL TESTS: " . ($passCount + $failCount) . "\n";
echo " PASSED:      {$passCount}\n";
echo " FAILED:      {$failCount}\n";
echo "====================================================================\n";

if ($failCount > 0) {
    exit(1);
}
exit(0);
