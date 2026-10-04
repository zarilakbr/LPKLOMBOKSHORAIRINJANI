<?php

/**
 * Verification Script: P0 Blockers & Hardening
 * Tests:
 * 1. Turnstile Production Fail-Closed & Bypass Prevention
 * 2. Google OAuth Hardening (Audience, Verified Email, Disallow Admin Takeover, Default SISWA)
 * 3. CORS Configuration Validation
 * 4. Public Registration -> Database -> Admin Flow
 * 5. Program & Class API Flow
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ActivityLog;
use App\Models\Program;
use App\Models\Registration;
use App\Models\User;
use App\Services\TurnstileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

echo "\n============================================================\n";
echo "RUNNING P0 BLOCKER & HARDENING VERIFICATION\n";
echo "============================================================\n\n";

$passCount = 0;
$failCount = 0;

function assertTest(bool $condition, string $label): void {
    global $passCount, $failCount;
    if ($condition) {
        echo "  [PASS] {$label}\n";
        $passCount++;
    } else {
        echo "  [FAIL] {$label}\n";
        $failCount++;
    }
}

// ---------------------------------------------------------------------
// TEST GROUP 1: Turnstile Security & Production Bypass Prevention
// ---------------------------------------------------------------------
echo "--- 1. Turnstile Security & Production Fail-Closed ---\n";

$turnstile = new TurnstileService();

// In local / testing environment, test tokens are permitted
assertTest(
    $turnstile->verify('1x00000000000000000000AA') === true,
    'Turnstile allows official test token in local/testing environment'
);
assertTest(
    $turnstile->verify('XXXX.arbitrary-mock-token') === true,
    'Turnstile allows XXXX prefix token in local/testing environment'
);

// Simulate production environment
$origEnv = app()['env'];
app()['env'] = 'production';

// In production, test tokens MUST NOT bypass!
assertTest(
    $turnstile->verify('1x00000000000000000000AA') === false,
    'Turnstile REJECTS official test token in production environment'
);
assertTest(
    $turnstile->verify('XXXX.arbitrary-mock-token') === false,
    'Turnstile REJECTS XXXX prefix token in production environment'
);

// In production, if secret key is missing, it must FAIL CLOSED
Config::set('services.turnstile.secret_key', null);
assertTest(
    $turnstile->verify('some-valid-looking-token') === false,
    'Turnstile FAILS CLOSED in production when secret key is unconfigured'
);

// Restore environment
app()['env'] = $origEnv;

// ---------------------------------------------------------------------
// TEST GROUP 2: Google OAuth Hardening
// ---------------------------------------------------------------------
echo "\n--- 2. Google OAuth Hardening ---\n";

$authController = app(\App\Http\Controllers\Api\Auth\AuthController::class);

// Configure fake OAuth credentials for unit simulation
Config::set('services.google.client_id', 'lpk-official-google-client-id.apps.googleusercontent.com');
Config::set('services.google.client_secret', 'lpk-mock-secret');
Config::set('services.google.redirect', 'http://localhost:8000/api/auth/google/callback');

// Dynamic Http::fake handler
$mockGoogleUser = [
    'email'          => 'student.candidate@example.com',
    'email_verified' => 'true',
    'aud'            => 'attacker-foreign-client-id.apps.googleusercontent.com', // WRONG AUDIENCE!
    'iss'            => 'https://accounts.google.com',
];

Http::fake(function ($request) use (&$mockGoogleUser) {
    if (str_contains($request->url(), 'tokeninfo')) {
        return Http::response($mockGoogleUser, 200);
    }
    return Http::response([], 404);
});

// 2a. Wrong Audience Token Simulation
$reqWrongAud = Request::create('/api/auth/google/callback', 'POST', ['id_token' => 'mock-wrong-aud-token']);
$resWrongAud = $authController->googleCallback($reqWrongAud);
$dataWrongAud = json_decode($resWrongAud->getContent(), true);

assertTest(
    $resWrongAud->getStatusCode() === 401 && str_contains($dataWrongAud['message'], 'Client ID'),
    'Google OAuth REJECTS token with mismatched audience (aud != client_id)'
);

// 2b. Unverified Email Token Simulation
$mockGoogleUser = [
    'email'          => 'student.unverified@example.com',
    'email_verified' => 'false', // UNVERIFIED!
    'aud'            => 'lpk-official-google-client-id.apps.googleusercontent.com',
    'iss'            => 'https://accounts.google.com',
];

$reqUnverified = Request::create('/api/auth/google/callback', 'POST', ['id_token' => 'mock-unverified-token']);
$resUnverified = $authController->googleCallback($reqUnverified);
$dataUnverified = json_decode($resUnverified->getContent(), true);

assertTest(
    $resUnverified->getStatusCode() === 401 && str_contains($dataUnverified['message'], 'belum diverifikasi'),
    'Google OAuth REJECTS token with unverified email (email_verified != true)'
);

// 2c. Disallow Silent Takeover of Existing ADMIN Account
$adminUser = User::where('role', User::ROLE_ADMIN)->first();
assertTest($adminUser !== null, 'Existing ADMIN user exists in database for testing');

if ($adminUser) {
    $mockGoogleUser = [
        'email'          => $adminUser->email,
        'email_verified' => 'true',
        'aud'            => 'lpk-official-google-client-id.apps.googleusercontent.com',
        'iss'            => 'https://accounts.google.com',
    ];

    $reqAdminTakeover = Request::create('/api/auth/google/callback', 'POST', ['id_token' => 'mock-admin-token']);
    $resAdminTakeover = $authController->googleCallback($reqAdminTakeover);
    $dataAdminTakeover = json_decode($resAdminTakeover->getContent(), true);

    assertTest(
        $resAdminTakeover->getStatusCode() === 403 && str_contains($dataAdminTakeover['message'], 'staf/pengajar/admin'),
        'Google OAuth PREVENTS silent account linking/takeover of existing ADMIN accounts'
    );
}

// 2d. New Google User Signup ALWAYS Has Role SISWA
$uniqueTestEmail = 'google.new.student.' . time() . '@example.test';
$mockGoogleUser = [
    'email'          => $uniqueTestEmail,
    'email_verified' => 'true',
    'name'           => 'Google New Student',
    'aud'            => 'lpk-official-google-client-id.apps.googleusercontent.com',
    'iss'            => 'https://accounts.google.com',
];

$reqNewGoogle = Request::create('/api/auth/google/callback', 'POST', ['id_token' => 'mock-new-user-token']);
$resNewGoogle = $authController->googleCallback($reqNewGoogle);
$dataNewGoogle = json_decode($resNewGoogle->getContent(), true);

assertTest(
    $resNewGoogle->getStatusCode() === 200 && ($dataNewGoogle['data']['role'] ?? null) === User::ROLE_SISWA,
    'Google OAuth new signup is strictly assigned role SISWA'
);

// Clean up test user
User::where('email', $uniqueTestEmail)->delete();

// ---------------------------------------------------------------------
// TEST GROUP 3: CORS Configuration
// ---------------------------------------------------------------------
echo "\n--- 3. CORS Configuration ---\n";

$corsConfig = config('cors');
assertTest(
    $corsConfig['supports_credentials'] === true,
    'CORS config maintains supports_credentials = true for Sanctum cookie/auth'
);
assertTest(
    !in_array('*', $corsConfig['allowed_origins'], true),
    'CORS config does NOT use wildcard * with credentials'
);
assertTest(
    in_array('http://localhost:5173', $corsConfig['allowed_origins'], true),
    'CORS config allows http://localhost:5173'
);

// ---------------------------------------------------------------------
// TEST GROUP 4: Public Registration -> Database -> Admin Review
// ---------------------------------------------------------------------
echo "\n--- 4. Real Public Registration Flow ---\n";

$regController = app(\App\Http\Controllers\Api\Public\RegistrationController::class);
$adminRegController = app(\App\Http\Controllers\Api\Admin\AdminRegistrationController::class);

function makeValidatedReq(string $class, string $uri, string $method, array $data, ?User $user = null) {
    global $app;
    $baseReq = Request::create($uri, $method, $data);
    $formReq = $class::createFrom($baseReq);
    $formReq->setContainer($app)->setRedirector($app->make('redirect'));
    if ($user) {
        $formReq->setUserResolver(fn () => $user);
    }
    $formReq->validateResolved();
    return $formReq;
}

$testEmail = 'calon.siswa.' . time() . '@example.test';
$regData = [
    'full_name'        => 'Budi Test Hardening',
    'email'            => $testEmail,
    'phone'            => '0812987654321',
    'dob'              => '2004-05-15',
    'education'        => 'SMA/SMK',
    'city'             => 'Mataram',
    'program_interest' => 'Bahasa Jepang Dasar (N5)',
    'japanese_level'   => 'Belum Pernah Belajar (Nol)',
    'japan_goal'       => 'Persiapan Studi & Kerja ke Jepang',
    'message'          => 'Saya ingin bergabung dengan angkatan baru.',
];

// Submit via Public Controller
$storeReq = makeValidatedReq(\App\Http\Requests\StoreRegistrationRequest::class, '/api/registrations', 'POST', $regData);
$storeRes = $regController->store($storeReq);
$storeJson = json_decode($storeRes->getContent(), true);

assertTest(
    $storeRes->getStatusCode() === 201 && !empty($storeJson['data']['registrationCode']),
    'Public registration submits successfully and returns generated registrationCode'
);

// Verify in Database
$savedReg = Registration::where('email', $testEmail)->first();
assertTest(
    $savedReg !== null && $savedReg->full_name === 'Budi Test Hardening',
    'Registration is persisted directly to the database'
);

// Admin queries registrations
$adminIndexReq = Request::create('/api/admin/registrations', 'GET', ['search' => 'Budi Test Hardening']);
$adminIndexRes = $adminRegController->index($adminIndexReq);
$adminIndexJson = json_decode($adminIndexRes->getContent(), true);

$foundInAdmin = false;
foreach ($adminIndexJson['data'] ?? [] as $item) {
    if ($item['email'] === $testEmail) {
        $foundInAdmin = true;
        break;
    }
}
assertTest($foundInAdmin, 'Admin API immediately sees newly registered student record');

// Admin updates status
if ($savedReg && $adminUser) {
    $updateReq = makeValidatedReq(
        \App\Http\Requests\UpdateRegistrationStatusRequest::class,
        "/api/admin/registrations/{$savedReg->id}",
        'PUT',
        ['status' => 'CONTACTED', 'admin_notes' => 'Sudah diverifikasi via telepon.'],
        $adminUser
    );
    $updateRes = $adminRegController->update($updateReq, $savedReg->id);
    $updateJson = json_decode($updateRes->getContent(), true);

    assertTest(
        $updateRes->getStatusCode() === 200 && ($updateJson['data']['status'] ?? null) === 'CONTACTED',
        'Admin can update registration status to CONTACTED with admin notes'
    );

    // Verify activity log was created
    $log = ActivityLog::where('module', 'Registrations')
        ->where('action', 'STATUS_CHANGE')
        ->orderBy('id', 'desc')
        ->first();
    assertTest(
        $log !== null && str_contains($log->description, 'CONTACTED'),
        'Registration status update records administrative activity log'
    );
}

// Clean up registration test record
if ($savedReg) {
    $savedReg->delete();
}

// ---------------------------------------------------------------------
// TEST GROUP 5: Admin Program CRUD Persistence
// ---------------------------------------------------------------------
echo "\n--- 5. Admin Program CRUD Persistence ---\n";

$adminProgController = app(\App\Http\Controllers\Api\Admin\AdminProgramController::class);
$publicProgController = app(\App\Http\Controllers\Api\Public\ProgramController::class);

$progData = [
    'title'             => 'Program Uji Integrasi P0 ' . time(),
    'category'          => 'Dasar & Pondasi',
    'level'             => 'N5 Beginner',
    'short_description' => 'Program uji coba kesiapan produksi.',
    'full_description'  => 'Deskripsi lengkap uji coba program integrasi REST API.',
    'duration'          => '3 Bulan',
    'schedule'          => 'Senin - Kamis',
    'price_estimate'    => 'Rp 3.000.000',
    'curriculum'        => ['Hiragana & Katakana', 'Tata Bahasa Dasar'],
    'status'            => 'ACTIVE',
    'order'             => 99,
];

$createProgReq = makeValidatedReq(\App\Http\Requests\StoreProgramRequest::class, '/api/admin/programs', 'POST', $progData, $adminUser);
$createProgRes = $adminProgController->store($createProgReq);
$createProgJson = json_decode($createProgRes->getContent(), true);

$createdProgId = $createProgJson['data']['id'] ?? null;
$createdSlug = $createProgJson['data']['slug'] ?? null;

assertTest(
    $createProgRes->getStatusCode() === 201 && !empty($createdProgId),
    'Admin can create program and persist to database via POST /api/admin/programs'
);

// Public can read the program
if ($createdSlug) {
    $pubProgRes = $publicProgController->show($createdSlug);
    $pubProgJson = json_decode($pubProgRes->getContent(), true);
    assertTest(
        $pubProgRes->getStatusCode() === 200 && ($pubProgJson['data']['id'] ?? null) === $createdProgId,
        'Public API immediately reads newly created program by slug'
    );
}

// Clean up program
if ($createdProgId) {
    $progModel = Program::find($createdProgId);
    if ($progModel) {
        $progModel->delete();
    }
}

// ---------------------------------------------------------------------
// SUMMARY
// ---------------------------------------------------------------------
echo "\n============================================================\n";
echo "P0 HARDENING RESULTS: {$passCount} PASSED, {$failCount} FAILED\n";
echo "============================================================\n\n";

exit($failCount > 0 ? 1 : 0);
