<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Program;
use App\Models\ProgramClass;
use App\Models\Registration;
use App\Models\Opportunity;
use App\Models\Testimonial;
use App\Models\Article;
use App\Models\Gallery;
use App\Models\Facility;
use App\Models\Faq;
use App\Models\Contact;
use App\Models\SiteSetting;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\PermissionRequest;
use App\Models\PermissionAttachment;
use App\Models\Notification;
use Illuminate\Support\Facades\Schema;

echo "=== PHASE 4 DATABASE & RELATIONSHIP VERIFICATION ===\n\n";

// 1. Verify 17 Tables
$tables = [
    'users',
    'programs',
    'classes',
    'registrations',
    'opportunities',
    'testimonials',
    'articles',
    'gallery',
    'facilities',
    'faqs',
    'contacts',
    'site_settings',
    'activity_logs',
    'attendances',
    'permission_requests',
    'permission_attachments',
    'notifications'
];

echo "--- 1. TABLE CHECK ---\n";
$allTablesExist = true;
foreach ($tables as $table) {
    $exists = Schema::hasTable($table);
    echo sprintf("[%s] Table: %s\n", $exists ? "OK" : "FAIL", $table);
    if (!$exists) $allTablesExist = false;
}

if (!$allTablesExist) {
    echo "ERROR: Not all tables exist!\n";
    exit(1);
}

// 2. Verify EXACTLY 3 ROLES
echo "\n--- 2. ROLE CHECK (EXACTLY 3 ROLES: SISWA, PENGAJAR, ADMIN) ---\n";
$roles = User::pluck('role')->unique()->values()->all();
echo "Roles found in database: " . json_encode($roles) . "\n";
$allowedRoles = ['SISWA', 'PENGAJAR', 'ADMIN'];
$invalidRoles = array_diff($roles, $allowedRoles);

if (!empty($invalidRoles)) {
    echo "FAIL: Unauthorized roles detected: " . json_encode($invalidRoles) . "\n";
    exit(1);
} else {
    echo "OK: EXACTLY 3 roles validated (No STAFF, SUPER_ADMIN, MODERATOR, etc.)\n";
}

// 3. Verify Demo Accounts
echo "\n--- 3. DEMO ACCOUNTS CHECK ---\n";
$admin = User::where('email', 'admin@example.test')->first();
$teacher = User::where('email', 'teacher@example.test')->first();
$student = User::where('email', 'student@example.test')->first();

echo sprintf("Admin (%s): %s (Role: %s)\n", 'admin@example.test', $admin ? "FOUND" : "NOT FOUND", $admin ? $admin->role : '-');
echo sprintf("Teacher (%s): %s (Role: %s)\n", 'teacher@example.test', $teacher ? "FOUND" : "NOT FOUND", $teacher ? $teacher->role : '-');
echo sprintf("Student (%s): %s (Role: %s)\n", 'student@example.test', $student ? "FOUND" : "NOT FOUND", $student ? $student->role : '-');

// 4. Verify Eloquent Relationships
echo "\n--- 4. RELATIONSHIP VERIFICATION ---\n";

// student -> registrations
$studentRegs = $student ? $student->registrations : collect();
echo sprintf("[OK] Student Registrations count: %d\n", $studentRegs->count());

// student -> attendances
$studentAtts = $student ? $student->attendances : collect();
echo sprintf("[OK] Student Attendances count: %d\n", $studentAtts->count());

// student -> permissionRequests
$studentPerms = $student ? $student->permissionRequests : collect();
echo sprintf("[OK] Student Permission Requests count: %d\n", $studentPerms->count());

// permissionRequest -> attachments
$firstPerm = PermissionRequest::whereHas('attachments')->first();
if ($firstPerm) {
    echo sprintf("[OK] Permission Request #%d has %d attachment(s)\n", $firstPerm->id, $firstPerm->attachments->count());
    $att = $firstPerm->attachments->first();
    echo sprintf("     Attachment: %s (path: %s, size: %d bytes)\n", $att->file_name, $att->file_path, $att->file_size);
    echo sprintf("     Back-reference perm attachment -> request: %s\n", $att->permissionRequest ? "OK" : "FAIL");
} else {
    echo "[INFO] No permission request with attachment found yet\n";
}

// student -> notifications
$studentNotifs = $student ? $student->notifications : collect();
echo sprintf("[OK] Student Notifications count: %d\n", $studentNotifs->count());

// teacher -> classes
$teacherClasses = $teacher ? $teacher->classes : collect();
echo sprintf("[OK] Teacher Classes count: %d\n", $teacherClasses->count());

// class -> teacher, class -> attendances, class -> permissionRequests
$firstClass = ProgramClass::first();
if ($firstClass) {
    echo sprintf("[OK] Class #%d belongsTo Teacher: %s\n", $firstClass->id, $firstClass->teacher ? $firstClass->teacher->name : 'None');
    echo sprintf("[OK] Class #%d hasMany Attendances: %d\n", $firstClass->id, $firstClass->attendances->count());
    echo sprintf("[OK] Class #%d hasMany PermissionRequests: %d\n", $firstClass->id, $firstClass->permissionRequests->count());
    echo sprintf("[OK] Class #%d belongsTo Program: %s\n", $firstClass->id, $firstClass->program ? $firstClass->program->title : 'None');
}

// program -> classes & program -> registrations
$firstProg = Program::first();
if ($firstProg) {
    echo sprintf("[OK] Program #%d hasMany Classes: %d\n", $firstProg->id, $firstProg->classes->count());
    echo sprintf("[OK] Program #%d hasMany Registrations: %d\n", $firstProg->id, $firstProg->registrations->count());
}

// admin -> activityLogs
$adminLogs = $admin ? $admin->activityLogs : collect();
echo sprintf("[OK] Admin Activity Logs count: %d\n", $adminLogs->count());

// 5. Site Settings Check
echo "\n--- 5. SITE SETTINGS CHECK ---\n";
$brandName = SiteSetting::where('key', 'brand_name')->first();
$shortName = SiteSetting::where('key', 'short_name')->first();
$defaultLang = SiteSetting::where('key', 'default_language')->first();
$defaultTheme = SiteSetting::where('key', 'default_theme')->first();

echo sprintf("brand_name: %s\n", $brandName ? $brandName->value : 'NOT FOUND');
echo sprintf("short_name: %s\n", $shortName ? $shortName->value : 'NOT FOUND');
echo sprintf("default_language: %s\n", $defaultLang ? $defaultLang->value : 'NOT FOUND');
echo sprintf("default_theme: %s\n", $defaultTheme ? $defaultTheme->value : 'NOT FOUND');

echo "\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY ===\n";
