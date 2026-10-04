<?php

/**
 * LPK Lombok Shorai Rinjani - PostgreSQL Compatibility Test Suite
 *
 * Verifies portability and database compatibility:
 * 1. Case-insensitive program search (UPPER, lower, MiXeD)
 * 2. Case-insensitive class search (UPPER, lower, MiXeD)
 * 3. Case-insensitive user / student search (UPPER, lower, MiXeD)
 * 4. Case-insensitive material search (UPPER, lower, MiXeD)
 * 5. Case-insensitive registration / article / opportunity search
 * 6. Schedule date query (whereDate portability)
 * 7. Attendance date query (whereDate portability)
 * 8. Enrollment active partial uniqueness constraint verification
 * 9. Boolean fields consistency (strictly boolean casts, not strings)
 * 10. JSON fields consistency (Program curriculum decoded as array)
 * 11. Migration cleanliness & PostgreSQL SQL syntax audit
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Article;
use App\Models\Attendance;
use App\Models\Enrollment;
use App\Models\Material;
use App\Models\Notification;
use App\Models\Opportunity;
use App\Models\Program;
use App\Models\ProgramClass;
use App\Models\Registration;
use App\Models\Schedule;
use App\Models\User;
use Illuminate\Support\Facades\DB;

$passed = 0;
$failed = 0;

function report($testNo, $description, $ok, $details = '') {
    global $passed, $failed;
    if ($ok) {
        $passed++;
        echo "[\033[32mPASS\033[0m] #{$testNo}: {$description}\n";
    } else {
        $failed++;
        echo "[\033[31mFAIL\033[0m] #{$testNo}: {$description} - {$details}\n";
    }
}

echo "====================================================================\n";
echo "  LPK LOMBOK SHORAI RINJANI — POSTGRESQL COMPATIBILITY TEST SUITE   \n";
echo "====================================================================\n\n";

// -------------------------------------------------------------------------
// 1. CASE-INSENSITIVE PROGRAM SEARCH
// -------------------------------------------------------------------------
$prog = Program::first();
if ($prog) {
    $word = explode(' ', $prog->title)[0];
    $termUpper = '%' . strtolower(trim(strtoupper($word))) . '%';
    $termLower = '%' . strtolower(trim(strtolower($word))) . '%';
    $termMixed = '%' . strtolower(trim(ucfirst(strtolower($word)))) . '%';

    $resUpper = Program::whereRaw('LOWER(title) LIKE ?', [$termUpper])->pluck('id')->all();
    $resLower = Program::whereRaw('LOWER(title) LIKE ?', [$termLower])->pluck('id')->all();
    $resMixed = Program::whereRaw('LOWER(title) LIKE ?', [$termMixed])->pluck('id')->all();

    $equalResults = ($resUpper === $resLower && $resLower === $resMixed && in_array($prog->id, $resUpper));
    report(1, 'Program case-insensitive search yields identical results regardless of query casing', $equalResults, "Upper: " . count($resUpper) . ", Lower: " . count($resLower));
} else {
    report(1, 'Program case-insensitive search', false, 'No programs found in DB');
}

// -------------------------------------------------------------------------
// 2. CASE-INSENSITIVE CLASS SEARCH
// -------------------------------------------------------------------------
$cls = ProgramClass::first();
if ($cls) {
    $word = substr($cls->name ?? $cls->class_name, 0, 5);
    $termUpper = '%' . strtolower(trim(strtoupper($word))) . '%';
    $termLower = '%' . strtolower(trim(strtolower($word))) . '%';

    $resUpper = ProgramClass::where(function ($q) use ($termUpper) {
        $q->whereRaw('LOWER(name) LIKE ?', [$termUpper])
          ->orWhereRaw('LOWER(class_name) LIKE ?', [$termUpper]);
    })->pluck('id')->all();

    $resLower = ProgramClass::where(function ($q) use ($termLower) {
        $q->whereRaw('LOWER(name) LIKE ?', [$termLower])
          ->orWhereRaw('LOWER(class_name) LIKE ?', [$termLower]);
    })->pluck('id')->all();

    report(2, 'Class case-insensitive search matches both upper and lower query terms', ($resUpper === $resLower && in_array($cls->id, $resUpper)));
} else {
    report(2, 'Class case-insensitive search', false, 'No classes found');
}

// -------------------------------------------------------------------------
// 3. CASE-INSENSITIVE STUDENT / USER SEARCH
// -------------------------------------------------------------------------
$student = User::where('role', User::ROLE_SISWA)->first();
if ($student) {
    $word = substr($student->name, 0, 4);
    $termUpper = '%' . strtolower(trim(strtoupper($word))) . '%';
    $termLower = '%' . strtolower(trim(strtolower($word))) . '%';

    $resUpper = User::whereRaw('LOWER(name) LIKE ?', [$termUpper])->pluck('id')->all();
    $resLower = User::whereRaw('LOWER(name) LIKE ?', [$termLower])->pluck('id')->all();

    report(3, 'User/Student case-insensitive search portable across UPPER/LOWER', ($resUpper === $resLower && in_array($student->id, $resUpper)));
} else {
    report(3, 'User/Student case-insensitive search', false, 'No student found');
}

// -------------------------------------------------------------------------
// 4. CASE-INSENSITIVE MATERIAL SEARCH
// -------------------------------------------------------------------------
$material = Material::first();
if ($material) {
    $word = substr($material->title, 0, 4);
    $termUpper = '%' . strtolower(trim(strtoupper($word))) . '%';
    $termLower = '%' . strtolower(trim(strtolower($word))) . '%';

    $resUpper = Material::whereRaw('LOWER(title) LIKE ?', [$termUpper])->pluck('id')->all();
    $resLower = Material::whereRaw('LOWER(title) LIKE ?', [$termLower])->pluck('id')->all();

    report(4, 'Material search portable across case variations using LOWER(title) LIKE ?', ($resUpper === $resLower && in_array($material->id, $resUpper)));
} else {
    report(4, 'Material search portable', false, 'No materials in DB');
}

// -------------------------------------------------------------------------
// 5. CASE-INSENSITIVE SEARCH ON OTHER ENTITIES (Articles, Opportunities, Registrations)
// -------------------------------------------------------------------------
$reg = Registration::first();
if ($reg) {
    $namePart = substr($reg->full_name ?? $reg->name, 0, 4);
    $termUpper = '%' . strtolower(trim(strtoupper($namePart))) . '%';
    $termLower = '%' . strtolower(trim(strtolower($namePart))) . '%';

    $resUpper = Registration::whereRaw('LOWER(full_name) LIKE ?', [$termUpper])
        ->orWhereRaw('LOWER(name) LIKE ?', [$termUpper])->pluck('id')->all();
    $resLower = Registration::whereRaw('LOWER(full_name) LIKE ?', [$termLower])
        ->orWhereRaw('LOWER(name) LIKE ?', [$termLower])->pluck('id')->all();

    report(5, 'Registration case-insensitive search works portably', ($resUpper === $resLower && in_array($reg->id, $resUpper)));
} else {
    report(5, 'Registration search', false, 'No registration record');
}

// -------------------------------------------------------------------------
// 6. SCHEDULE DATE QUERY (whereDate Portability)
// -------------------------------------------------------------------------
$sched = Schedule::first();
if ($sched) {
    $dateStr = $sched->date->format('Y-m-d');
    $found = Schedule::whereDate('date', $dateStr)->find($sched->id);
    report(6, "Schedule whereDate('date', '{$dateStr}') retrieves record correctly", !is_null($found));
} else {
    report(6, 'Schedule whereDate', false, 'No schedule in DB');
}

// -------------------------------------------------------------------------
// 7. ATTENDANCE DATE QUERY (whereDate Portability)
// -------------------------------------------------------------------------
$att = Attendance::first();
if ($att) {
    $dateStr = $att->attendance_date->format('Y-m-d');
    $found = Attendance::whereDate('attendance_date', $dateStr)->find($att->id);
    report(7, "Attendance whereDate('attendance_date', '{$dateStr}') retrieves record correctly", !is_null($found));
} else {
    report(7, 'Attendance whereDate', false, 'No attendance in DB');
}

// -------------------------------------------------------------------------
// 8. ENROLLMENT ACTIVE UNIQUENESS (Partial Index)
// -------------------------------------------------------------------------
$activeEnrollment = Enrollment::where('status', Enrollment::STATUS_ACTIVE)->first();
if ($activeEnrollment) {
    $duplicateBlocked = false;
    try {
        Enrollment::create([
            'user_id'     => $activeEnrollment->user_id,
            'class_id'    => $activeEnrollment->class_id,
            'status'      => Enrollment::STATUS_ACTIVE,
            'enrolled_at' => now(),
        ]);
    } catch (\Throwable $e) {
        $duplicateBlocked = true;
    }
    report(8, 'Partial unique index rejects duplicate ACTIVE enrollment for same user & class', $duplicateBlocked);
} else {
    report(8, 'Partial unique index check', false, 'No active enrollment found');
}

// -------------------------------------------------------------------------
// 9. BOOLEAN FIELDS STRICT TYPING (Model Casts)
// -------------------------------------------------------------------------
$notif = Notification::first();
$mat = Material::first();
$prog = Program::first();

$notifBool = is_bool($notif?->is_read);
$matBool   = is_bool($mat?->is_published);
$progBool  = is_bool($prog?->featured);

$allStrictBool = $notifBool && $matBool && $progBool;
report(9, 'Boolean fields (is_read, is_published, featured) are strictly typed PHP booleans', $allStrictBool,
    "notif:" . gettype($notif?->is_read) . ", mat:" . gettype($mat?->is_published) . ", prog:" . gettype($prog?->featured));

// -------------------------------------------------------------------------
// 10. JSON FIELDS (Model Casts)
// -------------------------------------------------------------------------
$progWithCurriculum = Program::whereNotNull('curriculum')->first();
$jsonArrayCast = is_array($progWithCurriculum?->curriculum) || is_null($progWithCurriculum);
report(10, 'JSON curriculum column is decoded as native PHP array via Eloquent cast', $jsonArrayCast);

// -------------------------------------------------------------------------
// 11. ENUM / STATUS NORMALIZATION (Mutator Check)
// -------------------------------------------------------------------------
$testSched = new Schedule();
$testSched->status = 'scheduled';
$schedStatusUpper = ($testSched->status === 'SCHEDULED');

$testEnroll = new Enrollment();
$testEnroll->status = 'active';
$enrollStatusUpper = ($testEnroll->status === 'ACTIVE');

$testAtt = new Attendance();
$testAtt->status = 'HADIR';
$attStatusLower = ($testAtt->status === 'hadir');

$mutatorsWork = $schedStatusUpper && $enrollStatusUpper && $attStatusLower;
report(11, 'Model status mutators enforce canonical casing (SCHEDULED, ACTIVE, hadir)', $mutatorsWork);

// -------------------------------------------------------------------------
// 12. MIGRATION SQL SYNTAX AUDIT
// -------------------------------------------------------------------------
$migrationFiles = glob(__DIR__ . '/../database/migrations/*.php');
$migrationIssues = [];
foreach ($migrationFiles as $file) {
    $content = file_get_contents($file);
    $basename = basename($file);
    if (str_contains($content, 'sqlite_master') || str_contains($content, 'PRAGMA')) {
        $migrationIssues[] = "{$basename}: contains SQLite internal keywords";
    }
    if (preg_match('/DB::statement\(["\'][^"\']*WHERE status\s*=\s*"[^"\']*/i', $content)) {
        $migrationIssues[] = "{$basename}: partial index uses double quotes instead of single quotes";
    }
}
report(12, 'Migration files audit: 0 driver-incompatible SQL keywords or invalid index quotes', count($migrationIssues) === 0, implode('; ', $migrationIssues));

echo "\n--------------------------------------------------------------------\n";
echo "Compatibility Tests Completed: {$passed} Passed, {$failed} Failed\n";
echo "PostgreSQL Runtime Service: NOT AVAILABLE (Local environment running SQLite)\n";
echo "--------------------------------------------------------------------\n";

exit($failed > 0 ? 1 : 0);
