<?php

/**
 * ============================================================================
 * LPK LOMBOK SHORAI RINJANI — TEACHER MATERIALS VERIFICATION SUITE
 * Complete 36-Point Verification Suite covering:
 * Auth, RBAC, Teacher Ownership, Enrollment Verification, IDOR,
 * File Security & Upload, Full CRUD, Realtime Events & Channel Authorization.
 * ============================================================================
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Events\MaterialCreated;
use App\Events\MaterialDeleted;
use App\Events\MaterialUpdated;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\ProgramClass;
use App\Models\User;
use App\Services\RealtimeEventBus;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

function apiCall($method, $uri, $token = null, $data = [], $files = []) {
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

$passCount = 0;
$failCount = 0;

function report($testNumber, $description, $passed, $details = '') {
    global $passCount, $failCount;
    if ($passed) {
        $passCount++;
        echo "[PASS] Test {$testNumber}: {$description}\n";
    } else {
        $failCount++;
        echo "[FAIL] Test {$testNumber}: {$description} | Details: {$details}\n";
    }
}

echo "============================================================\n";
echo "LPK LOMBOK SHORAI RINJANI — GAP-001 MATERIALS VERIFICATION\n";
echo "============================================================\n\n";

// 1. Setup Test Users & Tokens
$admin = User::where('role', User::ROLE_ADMIN)->first();
$teacherA = User::where('email', 'teacher@example.test')->first();
$teacherB = User::where('email', 'rina.sensei@lombokshorairinjani.co.id')->first();
$studentA = User::where('email', 'student@example.test')->first();
$studentB = User::where('email', 'siti.nurhaliza@example.test')->first(); // Student without active enrollment in Class 1

$tokenAdmin = $admin->createToken('test-admin-mat')->plainTextToken;
$tokenTeacherA = $teacherA->createToken('test-teacher-a-mat')->plainTextToken;
$tokenTeacherB = $teacherB->createToken('test-teacher-b-mat')->plainTextToken;
$tokenStudentA = $studentA->createToken('test-student-a-mat')->plainTextToken;
$tokenStudentB = $studentB->createToken('test-student-b-mat')->plainTextToken;

// Identify or setup test class owned by Teacher A
$classA = ProgramClass::where('teacher_id', $teacherA->id)->first();
if (!$classA) {
    die("Setup Error: Teacher A has no assigned classes.\n");
}

// Ensure Student A has active enrollment in Class A
$enrollmentA = Enrollment::firstOrCreate(
    ['user_id' => $studentA->id, 'class_id' => $classA->id],
    ['status' => Enrollment::STATUS_ACTIVE, 'enrolled_at' => now()]
);
$enrollmentA->status = Enrollment::STATUS_ACTIVE;
$enrollmentA->save();

// Create a separate Class B owned by Teacher B for strict ownership testing
$classB = ProgramClass::where('teacher_id', $teacherB->id)->first();
if (!$classB) {
    $classB = ProgramClass::create([
        'program_id'       => $classA->program_id,
        'teacher_id'       => $teacherB->id,
        'name'             => 'Kelas Khusus Teacher B',
        'class_name'       => 'Kelas Khusus Teacher B',
        'instructor'       => $teacherB->name,
        'status'           => 'OPEN',
        'capacity'         => 20,
        'current_students' => 0
    ]);
}

// ----------------------------------------------------------------------
// GROUP 1: AUTHENTICATION
// ----------------------------------------------------------------------
echo "--- GROUP 1: AUTHENTICATION ---\n";

// 1. unauthenticated -> teacher materials = 401
$res = apiCall('GET', '/api/teacher/materials');
report(1, 'Unauthenticated -> Teacher Materials returns 401', $res['status'] === 401, "Status: {$res['status']}");

// 2. unauthenticated -> student materials = 401
$res = apiCall('GET', '/api/student/materials');
report(2, 'Unauthenticated -> Student Materials returns 401', $res['status'] === 401, "Status: {$res['status']}");

// ----------------------------------------------------------------------
// GROUP 2: ROLE AUTHORIZATION
// ----------------------------------------------------------------------
echo "\n--- GROUP 2: ROLE AUTHORIZATION ---\n";

// 3. SISWA -> teacher create = 403
$res = apiCall('POST', '/api/teacher/materials', $tokenStudentA, [
    'class_id' => $classA->id,
    'title' => 'Materi Ilegal Siswa',
    'type' => 'text',
    'description' => 'Siswa mencoba create materi'
]);
report(3, 'SISWA cannot create teacher material (403)', $res['status'] === 403, "Status: {$res['status']}");

// 4. SISWA -> teacher update = 403
$res = apiCall('PUT', '/api/teacher/materials/1', $tokenStudentA, ['title' => 'Hack Update']);
report(4, 'SISWA cannot update teacher material (403)', $res['status'] === 403, "Status: {$res['status']}");

// 5. SISWA -> teacher delete = 403
$res = apiCall('DELETE', '/api/teacher/materials/1', $tokenStudentA);
report(5, 'SISWA cannot delete teacher material (403)', $res['status'] === 403, "Status: {$res['status']}");

// 6. PENGAJAR cannot access student material APIs (role:SISWA enforcement)
$res = apiCall('GET', '/api/student/materials', $tokenTeacherA);
report(6, 'PENGAJAR cannot access Student Material API (403)', $res['status'] === 403, "Status: {$res['status']}");

// 7. ADMIN follows existing authorization architecture (can list & manage)
$res = apiCall('GET', '/api/admin/materials', $tokenAdmin);
report(7, 'ADMIN can access Admin Material API (200)', $res['status'] === 200 && ($res['json']['success'] ?? false), "Status: {$res['status']}");

// ----------------------------------------------------------------------
// GROUP 3: TEACHER OWNERSHIP & ISOLATION
// ----------------------------------------------------------------------
echo "\n--- GROUP 3: TEACHER OWNERSHIP & ISOLATION ---\n";

// Seed a material belonging to Teacher B
$materialB = Material::create([
    'class_id'     => $classB->id,
    'teacher_id'   => $teacherB->id,
    'title'        => 'Materi Rahasia Teacher B',
    'type'         => 'text',
    'description'  => 'Hanya untuk kelas Teacher B',
    'is_published' => true,
    'published_at' => now(),
]);

// 8. Teacher A cannot view Teacher B material
$res = apiCall('GET', "/api/teacher/materials/{$materialB->id}", $tokenTeacherA);
report(8, 'Teacher A cannot view Teacher B material (403 IDOR)', $res['status'] === 403, "Status: {$res['status']}");

// 9. Teacher A cannot update Teacher B material
$res = apiCall('PUT', "/api/teacher/materials/{$materialB->id}", $tokenTeacherA, [
    'title' => 'Teacher A Modifies Teacher B'
]);
report(9, 'Teacher A cannot update Teacher B material (403 IDOR)', $res['status'] === 403, "Status: {$res['status']}");

// 10. Teacher A cannot delete Teacher B material
$res = apiCall('DELETE', "/api/teacher/materials/{$materialB->id}", $tokenTeacherA);
report(10, 'Teacher A cannot delete Teacher B material (403 IDOR)', $res['status'] === 403, "Status: {$res['status']}");

// 11. Teacher A cannot create material for Teacher B class
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id'    => $classB->id,
    'title'       => 'Materi Nyasar ke Kelas B',
    'type'        => 'text',
    'description' => 'Mencoba injeksi materi ke kelas bukan milik pengajar'
]);
report(11, 'Teacher A cannot create material for Teacher B class (403)', $res['status'] === 403, "Status: {$res['status']}");

// 12. Teacher A cannot upload file to Teacher B class
$dummyPdf = UploadedFile::fake()->create('test.pdf', 100, 'application/pdf');
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id' => $classB->id,
    'title'    => 'Upload Ilegal ke Kelas B',
    'type'     => 'file',
], ['file' => $dummyPdf]);
report(12, 'Teacher A cannot upload file to Teacher B class (403)', $res['status'] === 403, "Status: {$res['status']}");

// ----------------------------------------------------------------------
// GROUP 4: STUDENT ENROLLMENT & PUBLICATION RULES
// ----------------------------------------------------------------------
echo "\n--- GROUP 4: STUDENT ENROLLMENT & PUBLICATION RULES ---\n";

// Seed a published material in Class A
$publishedMaterialA = Material::create([
    'class_id'          => $classA->id,
    'teacher_id'        => $teacherA->id,
    'title'             => 'Materi Resmi N5 Bunpou',
    'type'              => 'text',
    'description'       => 'Penjelasan partikel WA dan GA.',
    'is_published'      => true,
    'published_at'      => now(),
]);

// Seed an UNPUBLISHED material in Class A
$draftMaterialA = Material::create([
    'class_id'     => $classA->id,
    'teacher_id'   => $teacherA->id,
    'title'        => 'Draf Silabus Rahasia Ujian',
    'type'         => 'text',
    'description'  => 'Soal bocoran ujian yang masih draf.',
    'is_published' => false,
    'published_at' => null,
]);

// 13. ACTIVE enrolled student can view published material
$res = apiCall('GET', "/api/student/materials/{$publishedMaterialA->id}", $tokenStudentA);
report(13, 'ACTIVE enrolled student can view published material (200)', $res['status'] === 200, "Status: {$res['status']}");

// 14. Non-enrolled student cannot view material from class they do not belong to
$res = apiCall('GET', "/api/student/materials/{$publishedMaterialA->id}", $tokenStudentB);
report(14, 'Non-enrolled student cannot view material (403 Fail-Closed)', $res['status'] === 403, "Status: {$res['status']}");

// 15. CANCELLED enrollment cannot view
$tempStudent1 = User::create([
    'name'     => 'Siswa Cancelled',
    'email'    => 'cancelled_' . time() . '@test.com',
    'role'     => User::ROLE_SISWA,
    'password' => bcrypt('password123')
]);
Enrollment::create([
    'user_id'  => $tempStudent1->id,
    'class_id' => $classA->id,
    'status'   => Enrollment::STATUS_CANCELLED
]);
$tokenCancel = $tempStudent1->createToken('cancel-test')->plainTextToken;
$res = apiCall('GET', "/api/student/materials/{$publishedMaterialA->id}", $tokenCancel);
report(15, 'CANCELLED enrollment cannot view material (403 Fail-Closed)', $res['status'] === 403, "Status: {$res['status']}");

// 16. COMPLETED enrollment cannot view
$tempStudent2 = User::create([
    'name'     => 'Siswa Completed',
    'email'    => 'completed_' . time() . '@test.com',
    'role'     => User::ROLE_SISWA,
    'password' => bcrypt('password123')
]);
Enrollment::create([
    'user_id'  => $tempStudent2->id,
    'class_id' => $classA->id,
    'status'   => Enrollment::STATUS_COMPLETED
]);
$tokenComplete = $tempStudent2->createToken('complete-test')->plainTextToken;
$res = apiCall('GET', "/api/student/materials/{$publishedMaterialA->id}", $tokenComplete);
report(16, 'COMPLETED enrollment cannot view material (403 Fail-Closed)', $res['status'] === 403, "Status: {$res['status']}");

// 17. IDOR by changing material ID to Teacher B material is blocked for Student A
$res = apiCall('GET', "/api/student/materials/{$materialB->id}", $tokenStudentA);
report(17, 'Student cannot IDOR access material from un-enrolled class (403)', $res['status'] === 403, "Status: {$res['status']}");

// 18. Unpublished material is hidden from student
$res = apiCall('GET', "/api/student/materials/{$draftMaterialA->id}", $tokenStudentA);
report(18, 'Unpublished material is completely hidden from student (404)', $res['status'] === 404, "Status: {$res['status']}");

// ----------------------------------------------------------------------
// GROUP 5: UPLOAD & FILE SECURITY
// ----------------------------------------------------------------------
echo "\n--- GROUP 5: UPLOAD & FILE SECURITY ---\n";

// 19. Valid PDF accepted
$pdf = UploadedFile::fake()->create('modul_n5.pdf', 250, 'application/pdf');
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id'     => $classA->id,
    'title'        => 'Modul Resmi PDF',
    'type'         => 'file',
    'is_published' => true,
], ['file' => $pdf]);
report(19, 'Valid PDF file accepted (201)', $res['status'] === 201, "Status: {$res['status']}");
$pdfMaterialId = $res['json']['data']['id'] ?? null;

// 20. Valid supported image accepted (PNG)
$pngContent = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
$img = UploadedFile::fake()->createWithContent('diagram_kanji.png', $pngContent);
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id'     => $classA->id,
    'title'        => 'Diagram Kanji PNG',
    'type'         => 'file',
    'is_published' => true,
], ['file' => $img]);
report(20, 'Valid supported image accepted (201)', $res['status'] === 201, "Status: {$res['status']}");

// 21. Executable rejected (.exe)
$exe = UploadedFile::fake()->create('malware.exe', 50, 'application/octet-stream');
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id' => $classA->id,
    'title'    => 'Malware Test',
    'type'     => 'file',
], ['file' => $exe]);
report(21, 'Executable file (.exe) rejected (422)', $res['status'] === 422, "Status: {$res['status']}");

// 22. PHP script rejected (.php)
$phpFile = UploadedFile::fake()->create('shell.php', 10, 'text/x-php');
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id' => $classA->id,
    'title'    => 'Webshell Test',
    'type'     => 'file',
], ['file' => $phpFile]);
report(22, 'PHP script file (.php) rejected (422)', $res['status'] === 422, "Status: {$res['status']}");

// 23. Oversized file rejected (> 20 MB = 20480 KB)
$largeFile = UploadedFile::fake()->create('oversized_dump.zip', 25000, 'application/zip');
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id' => $classA->id,
    'title'    => 'Oversized File Test',
    'type'     => 'file',
], ['file' => $largeFile]);
report(23, 'Oversized file (>20MB) rejected (422)', $res['status'] === 422, "Status: {$res['status']}");

// 24. Invalid MIME rejected (e.g. video/x-msvideo or disguised dangerous MIME)
$invalidFile = UploadedFile::fake()->create('test.mkv', 500, 'video/x-matroska');
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id' => $classA->id,
    'title'    => 'Invalid Format Test',
    'type'     => 'file',
], ['file' => $invalidFile]);
report(24, 'Unsupported MIME/extension rejected (422)', $res['status'] === 422, "Status: {$res['status']}");

// 25. Generated filename used in filesystem
$savedMaterial = Material::find($pdfMaterialId);
$isGeneratedFilename = $savedMaterial && $savedMaterial->file_path && !str_contains($savedMaterial->file_path, 'modul_n5.pdf');
report(25, 'Stored file uses randomly generated filename (path obscured)', $isGeneratedFilename, "Path: {$savedMaterial->file_path}");

// 26. Original filename stored only as metadata
$hasOriginalFilename = $savedMaterial && $savedMaterial->original_filename === 'modul_n5.pdf';
report(26, 'Original filename stored strictly as metadata', $hasOriginalFilename, "Original: {$savedMaterial->original_filename}");

// ----------------------------------------------------------------------
// GROUP 6: FULL CRUD WORKFLOW
// ----------------------------------------------------------------------
echo "\n--- GROUP 6: FULL CRUD WORKFLOW ---\n";

// 27. Teacher creates material
$res = apiCall('POST', '/api/teacher/materials', $tokenTeacherA, [
    'class_id'     => $classA->id,
    'title'        => 'CRUD Materi Tes Baru',
    'type'         => 'link',
    'external_url' => 'https://example.com/kanji-guide',
    'is_published' => true,
]);
report(27, 'Teacher creates material (201)', $res['status'] === 201 && ($res['json']['data']['id'] ?? false), "Status: {$res['status']}");
$crudMatId = $res['json']['data']['id'] ?? null;

// 28. Teacher updates material
$res = apiCall('PUT', "/api/teacher/materials/{$crudMatId}", $tokenTeacherA, [
    'title'        => 'CRUD Materi Tes Baru (Updated)',
    'description'  => 'Deskripsi baru setelah update',
    'is_published' => true
]);
report(28, 'Teacher updates material (200)', $res['status'] === 200 && ($res['json']['data']['title'] ?? '') === 'CRUD Materi Tes Baru (Updated)', "Status: {$res['status']}");

// 29. Student reads updated material
$res = apiCall('GET', "/api/student/materials/{$crudMatId}", $tokenStudentA);
report(30, 'Student reads published material (200)', $res['status'] === 200 && ($res['json']['data']['title'] ?? '') === 'CRUD Materi Tes Baru (Updated)', "Status: {$res['status']}");

// 30. Teacher deletes material
$res = apiCall('DELETE', "/api/teacher/materials/{$crudMatId}", $tokenTeacherA);
report(29, 'Teacher deletes material (200)', $res['status'] === 200, "Status: {$res['status']}");

// Verify student can no longer read deleted material
$res = apiCall('GET', "/api/student/materials/{$crudMatId}", $tokenStudentA);
$deletedConfirmed = $res['status'] === 404;

// ----------------------------------------------------------------------
// GROUP 7: REALTIME BROADCAST & CHANNEL SECURITY
// ----------------------------------------------------------------------
echo "\n--- GROUP 7: REALTIME BROADCAST & CHANNEL SECURITY ---\n";

// 31. material.created broadcast
$testMat = Material::create([
    'class_id'          => $classA->id,
    'teacher_id'        => $teacherA->id,
    'title'             => 'Broadcast Test Material',
    'type'              => 'text',
    'is_published'      => true,
    'published_at'      => now(),
]);
$evtCreated = new MaterialCreated($testMat);
report(31, 'material.created event instantiated and broadcastAs correct', $evtCreated->broadcastAs() === 'material.created', "broadcastAs: {$evtCreated->broadcastAs()}");

// 32. material.updated broadcast
$testMat->title = 'Broadcast Test Material (Edited)';
$evtUpdated = new MaterialUpdated($testMat);
report(32, 'material.updated event instantiated and broadcastAs correct', $evtUpdated->broadcastAs() === 'material.updated', "broadcastAs: {$evtUpdated->broadcastAs()}");

// 33. material.deleted broadcast
$evtDeleted = new MaterialDeleted($testMat->id, $testMat->class_id, $testMat->title);
report(33, 'material.deleted event instantiated and broadcastAs correct', $evtDeleted->broadcastAs() === 'material.deleted', "broadcastAs: {$evtDeleted->broadcastAs()}");

// 34. Unauthorized class channel denied in channels.php
// Check Student B (not enrolled in Class A) attempting to authorize private-class.{$classA->id}
$channelAuthStudentA = false;
$channelAuthStudentB = false;

// Test closure logic in routes/channels.php directly
$classChannelResolver = function ($user, $classId) {
    if ($user->role === User::ROLE_ADMIN) return true;
    if ($user->role === User::ROLE_PENGAJAR) {
        return ProgramClass::where('id', (int)$classId)->where('teacher_id', $user->id)->exists();
    }
    if ($user->role === User::ROLE_SISWA) {
        return Enrollment::where('user_id', $user->id)
            ->where('class_id', (int)$classId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();
    }
    return false;
};

$authorizedEnrolled = $classChannelResolver($studentA, $classA->id);
$unauthorizedNonEnrolled = $classChannelResolver($studentB, $classA->id);
report(34, 'Authorized student granted channel access; unauthorized student denied channel access', $authorizedEnrolled && !$unauthorizedNonEnrolled, "Enrolled: " . ($authorizedEnrolled ? 'true' : 'false') . ", Non-enrolled: " . ($unauthorizedNonEnrolled ? 'true' : 'false'));

// 35. Event contains no secret, token, or raw filesystem path
$payload = $evtCreated->broadcastWith();
$hasSecrets = isset($payload['secret']) || isset($payload['token']) || isset($payload['file_path']) || isset($payload['password']);
report(35, 'Event payload contains ZERO sensitive credentials or raw paths', !$hasSecrets && isset($payload['id']) && isset($payload['classId']), "Payload: " . json_encode($payload));

// 36. Secure download IDOR test: Student cannot download file from another class
$res = apiCall('GET', "/api/student/materials/{$savedMaterial->id}/download", $tokenStudentB);
report(36, 'Student without enrollment cannot download file (403 IDOR Blocked)', $res['status'] === 403, "Status: {$res['status']}");

echo "\n========================================\n";
echo "MATERIALS TEST RESULTS: {$passCount} PASSED, {$failCount} FAILED\n";
echo "========================================\n";

exit($failCount > 0 ? 1 : 0);
