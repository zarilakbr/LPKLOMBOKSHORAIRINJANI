<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use App\Services\TurnstileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService,
        protected TurnstileService $turnstileService
    ) {}

    /**
     * Authenticate user and issue Sanctum token with server-side Turnstile verification.
     */
    public function login(Request $request): JsonResponse
    {
        // 1. Human Verification / Anti-Bot (Cloudflare Turnstile)
        if ($request->filled('turnstile_token') || !app()->environment('local', 'testing')) {
            if (!$this->turnstileService->verify($request->input('turnstile_token'), $request->ip())) {
                return $this->sendError('Verifikasi keamanan Turnstile gagal. Silakan coba lagi.', [
                    'turnstile' => ['Verifikasi keamanan Turnstile tidak valid atau kedaluwarsa.']
                ], 422);
            }
        }

        // 2. Validate Credentials Input
        $validator = Validator::make($request->all(), [
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required'    => 'Alamat email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi gagal.', $validator->errors(), 422);
        }

        $user = User::where('email', strtolower(trim($request->email)))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->sendError('Kredensial yang dimasukkan tidak cocok dengan data kami.', [], 401);
        }

        if ($user->status !== User::STATUS_ACTIVE) {
            return $this->sendError('Akun Anda dinonaktifkan. Silakan hubungi pengelola lembaga.', [], 403);
        }

        $user->tokens()->delete(); // Clear older tokens
        $token = $user->createToken('auth-api-token')->plainTextToken;

        $user->update(['last_login_at' => now()]);

        // Authority Rule: Backend strictly determines true role and route
        $redirectUrl = match ($user->role) {
            User::ROLE_ADMIN    => '/admin/dashboard',
            User::ROLE_PENGAJAR => '/teacher/dashboard',
            default             => '/dashboard',
        };

        $this->activityLogService->log(
            $user->id,
            $user->name,
            'LOGIN',
            'Authentication',
            "Pengguna {$user->name} ({$user->role}) berhasil masuk ke sistem."
        );

        return $this->sendResponse([
            'token'       => $token,
            'user'        => new UserResource($user),
            'role'        => $user->role,
            'redirectUrl' => $redirectUrl,
        ], 'Login berhasil.');
    }

    /**
     * Register a new student user account with Turnstile human verification.
     */
    public function register(Request $request): JsonResponse
    {
        // 1. Human Verification / Anti-Bot (Cloudflare Turnstile)
        if ($request->filled('turnstile_token') || !app()->environment('local', 'testing')) {
            if (!$this->turnstileService->verify($request->input('turnstile_token'), $request->ip())) {
                return $this->sendError('Verifikasi keamanan Turnstile gagal. Silakan coba lagi.', [
                    'turnstile' => ['Verifikasi keamanan Turnstile tidak valid atau kedaluwarsa.']
                ], 422);
            }
        }

        // 2. Validate Registration Input
        $validator = Validator::make($request->all(), [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone'    => ['nullable', 'string', 'max:25'],
        ], [
            'name.required'     => 'Nama lengkap wajib diisi.',
            'email.required'    => 'Alamat email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'email.unique'      => 'Alamat email sudah terdaftar. Silakan masuk menggunakan akun Anda.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min'      => 'Kata sandi minimal 6 karakter.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi gagal.', $validator->errors(), 422);
        }

        // 3. Create User with default SISWA role (Authority in backend)
        $user = User::create([
            'name'          => trim($request->name),
            'email'         => strtolower(trim($request->email)),
            'phone'         => $request->phone ? trim($request->phone) : null,
            'password'      => Hash::make($request->password),
            'role'          => User::ROLE_SISWA, // Exactly 3 roles, registration is always SISWA
            'status'        => User::STATUS_ACTIVE,
            'department'    => 'Calon Siswa',
            'last_login_at' => now(),
        ]);

        $token = $user->createToken('auth-api-token')->plainTextToken;

        $this->activityLogService->log(
            $user->id,
            $user->name,
            'REGISTER',
            'Authentication',
            "Pendaftaran akun siswa baru {$user->email} berhasil."
        );

        return $this->sendResponse([
            'token'       => $token,
            'user'        => new UserResource($user),
            'role'        => $user->role,
            'redirectUrl' => '/dashboard',
        ], 'Pendaftaran akun berhasil.', 201);
    }

    /**
     * Get Google OAuth redirect configuration or URL.
     */
    public function googleRedirect(): JsonResponse
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect');

        if (empty($clientId) || empty($clientSecret)) {
            return $this->sendError(
                'Layanan Google OAuth belum dikonfigurasi di server backend. Silakan masuk menggunakan email dan kata sandi Anda.',
                ['configured' => false],
                503
            );
        }

        $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id'             => $clientId,
            'redirect_uri'          => $redirectUri,
            'response_type'         => 'code',
            'scope'                 => 'openid email profile',
            'access_type'           => 'offline',
            'prompt'                => 'select_account',
            'include_granted_scopes'=> 'true',
        ]);

        return $this->sendResponse([
            'url'        => $authUrl,
            'configured' => true,
        ], 'Google OAuth URL berhasil dimuat.');
    }

    /**
     * Handle Google OAuth Callback with server-side validation.
     */
    public function googleCallback(Request $request): JsonResponse
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        $redirectUri = config('services.google.redirect');

        if (empty($clientId) || empty($clientSecret)) {
            return $this->sendError(
                'Layanan Google OAuth belum dikonfigurasi di server backend. Silakan masuk menggunakan email dan kata sandi Anda.',
                ['configured' => false],
                503
            );
        }

        $code = $request->input('code');
        $idToken = $request->input('id_token');

        if (empty($code) && empty($idToken)) {
            return $this->sendError('Parameter otorisasi Google tidak ditemukan.', [], 400);
        }

        try {
            $googleUser = null;

            if ($idToken) {
                // Verify Google ID token directly with Google API
                $tokenInfoRes = Http::get("https://oauth2.googleapis.com/tokeninfo?id_token={$idToken}");
                if ($tokenInfoRes->successful()) {
                    $googleUser = $tokenInfoRes->json();
                }
            } elseif ($code) {
                // Exchange authorization code for token
                $tokenRes = Http::asForm()->post('https://oauth2.googleapis.com/token', [
                    'code'          => $code,
                    'client_id'     => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri'  => $redirectUri,
                    'grant_type'    => 'authorization_code',
                ]);

                if ($tokenRes->successful()) {
                    $tokenData = $tokenRes->json();
                    $accessToken = $tokenData['access_token'] ?? null;
                    if ($accessToken) {
                        $userRes = Http::withToken($accessToken)->get('https://www.googleapis.com/oauth2/v3/userinfo');
                        if ($userRes->successful()) {
                            $googleUser = $userRes->json();
                        }
                    }
                }
            }

            if (!$googleUser || empty($googleUser['email'])) {
                return $this->sendError('Verifikasi identitas akun Google gagal dari server.', [], 401);
            }

            $email = strtolower(trim($googleUser['email']));
            $name = $googleUser['name'] ?? explode('@', $email)[0];
            $avatar = $googleUser['picture'] ?? null;

            // Find existing user or register new as SISWA
            $user = User::where('email', $email)->first();

            if (!$user) {
                $user = User::create([
                    'name'          => $name,
                    'email'         => $email,
                    'avatar'        => $avatar,
                    'password'      => Hash::make(bin2hex(random_bytes(16))),
                    'role'          => User::ROLE_SISWA,
                    'status'        => User::STATUS_ACTIVE,
                    'last_login_at' => now(),
                ]);
            } else {
                if ($user->status !== User::STATUS_ACTIVE) {
                    return $this->sendError('Akun Anda dinonaktifkan. Silakan hubungi pengelola lembaga.', [], 403);
                }
                $user->update(['last_login_at' => now()]);
            }

            $user->tokens()->delete();
            $token = $user->createToken('auth-google-token')->plainTextToken;

            $redirectUrl = match ($user->role) {
                User::ROLE_ADMIN    => '/admin/dashboard',
                User::ROLE_PENGAJAR => '/teacher/dashboard',
                default             => '/dashboard',
            };

            $this->activityLogService->log(
                $user->id,
                $user->name,
                'GOOGLE_LOGIN',
                'Authentication',
                "Pengguna {$user->name} berhasil masuk via Google OAuth."
            );

            return $this->sendResponse([
                'token'       => $token,
                'user'        => new UserResource($user),
                'role'        => $user->role,
                'redirectUrl' => $redirectUrl,
            ], 'Login Google berhasil.');
        } catch (\Throwable $e) {
            Log::error('Google OAuth callback error: ' . $e->getMessage());
            return $this->sendError('Terjadi kesalahan saat memproses otentikasi Google.', [], 500);
        }
    }

    /**
     * Get currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->sendResponse(
            new UserResource($request->user()),
            'Data profil berhasil dimuat.'
        );
    }

    /**
     * Log out current user and revoke token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            $this->activityLogService->log(
                $user->id,
                $user->name,
                'LOGOUT',
                'Authentication',
                "Pengguna {$user->name} keluar dari sistem."
            );

            $user->currentAccessToken()->delete();
        }

        return $this->sendResponse(null, 'Berhasil keluar dari sistem.');
    }
}
