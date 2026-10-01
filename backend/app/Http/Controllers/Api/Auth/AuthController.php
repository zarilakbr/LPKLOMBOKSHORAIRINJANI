<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    /**
     * Authenticate user and issue Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
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

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->sendError('Kredensial yang dimasukkan tidak cocok dengan data kami.', [], 401);
        }

        if ($user->status !== 'ACTIVE') {
            return $this->sendError('Akun Anda dinonaktifkan. Silakan hubungi Super Admin.', [], 403);
        }

        $user->tokens()->delete(); // Clear older tokens
        $token = $user->createToken('admin-api-token')->plainTextToken;

        $user->update(['last_login_at' => now()]);

        $this->activityLogService->log(
            $user->id,
            $user->name,
            'LOGIN',
            'Authentication',
            "Pengguna {$user->name} berhasil masuk ke dashboard admin."
        );

        return $this->sendResponse([
            'token' => $token,
            'user'  => new UserResource($user),
        ], 'Login berhasil.');
    }

    /**
     * Get currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->sendResponse(
            new UserResource($request->user()),
            'Data profil admin berhasil dimuat.'
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
                "Pengguna {$user->name} keluar dari dashboard."
            );

            $user->currentAccessToken()->delete();
        }

        return $this->sendResponse(null, 'Berhasil keluar dari sistem.');
    }
}
