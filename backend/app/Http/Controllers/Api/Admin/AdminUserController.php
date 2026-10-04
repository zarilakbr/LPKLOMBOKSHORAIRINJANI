<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminUserController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(email) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(department) LIKE ?', [$term]);
            });
        }

        if ($request->has('role') && $request->role !== 'ALL') {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $perPage = min(100, max(1, $request->integer('per_page', 15)));
        $users = $query->orderBy('id', 'desc')->paginate($perPage);

        return $this->sendPaginated($users, 'Daftar pengguna admin berhasil dimuat.');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Users',
            "Menambahkan staf/admin baru: {$user->name} ({$user->email}) dengan peran {$user->role}."
        );

        return $this->sendResponse(
            new UserResource($user),
            'Pengguna berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('Pengguna tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new UserResource($user),
            'Detail pengguna berhasil dimuat.'
        );
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('Pengguna tidak ditemukan.', [], 404);
        }

        $data = $request->validated();

        // Admin Protection: Prevent demoting or deactivating the last active administrator
        if ($user->role === User::ROLE_ADMIN) {
            $isDemoting = isset($data['role']) && $data['role'] !== User::ROLE_ADMIN;
            $isDeactivating = isset($data['status']) && $data['status'] !== User::STATUS_ACTIVE;

            if ($isDemoting || $isDeactivating) {
                $activeAdminCount = User::where('role', User::ROLE_ADMIN)
                    ->where('status', User::STATUS_ACTIVE)
                    ->count();

                if ($activeAdminCount <= 1) {
                    return $this->sendError('Tidak dapat mengubah peran atau menonaktifkan Administrator terakhir. Sistem harus memiliki minimal satu Administrator aktif.', [], 422);
                }
            }
        }

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Users',
            "Memperbarui data pengguna: {$user->name}."
        );

        return $this->sendResponse(
            new UserResource($user),
            'Data pengguna berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $currentUser = $request->user();
        if (!$currentUser) {
            return $this->sendError('Unauthenticated.', [], 401);
        }
        if ($currentUser->role !== User::ROLE_ADMIN) {
            return $this->sendError('Akses ditolak. Hanya Administrator yang dapat menghapus pengguna.', [], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return $this->sendError('Pengguna tidak ditemukan.', [], 404);
        }

        if ($currentUser->id === $user->id) {
            return $this->sendError('Anda tidak dapat menghapus akun Anda sendiri.', [], 400);
        }

        // Admin Protection: Prevent deleting the last active administrator
        if ($user->role === User::ROLE_ADMIN) {
            $activeAdminCount = User::where('role', User::ROLE_ADMIN)
                ->where('status', User::STATUS_ACTIVE)
                ->count();

            if ($activeAdminCount <= 1) {
                return $this->sendError('Tidak dapat menghapus Administrator terakhir. Sistem harus memiliki minimal satu Administrator aktif.', [], 422);
            }
        }

        $name = $user->name;
        $user->delete();

        $this->activityLogService->log(
            $currentUser->id,
            $currentUser->name,
            'DELETE',
            'Users',
            "Menghapus akses pengguna admin: {$name}."
        );

        return $this->sendResponse(null, 'Pengguna berhasil dihapus.');
    }

    /**
     * Approve a pending user account (Teacher or Student).
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $currentUser = $request->user();
        if (!$currentUser) {
            return $this->sendError('Unauthenticated.', [], 401);
        }
        if ($currentUser->role !== User::ROLE_ADMIN) {
            return $this->sendError('Akses ditolak. Hanya Administrator yang dapat memverifikasi pengguna.', [], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return $this->sendError('Pengguna tidak ditemukan.', [], 404);
        }

        $user->update([
            'status'           => User::STATUS_ACTIVE,
            'approved_at'      => now(),
            'approved_by'      => $currentUser->id,
            'rejected_at'      => null,
            'rejection_reason' => null,
        ]);

        $this->activityLogService->log(
            $currentUser->id,
            $currentUser->name,
            'APPROVE_USER',
            'Users',
            "Menyetujui pendaftaran pengguna {$user->name} ({$user->email}) dengan peran {$user->role}."
        );

        return $this->sendResponse(
            new UserResource($user),
            'Pendaftaran pengguna berhasil disetujui dan akun diaktifkan.'
        );
    }

    /**
     * Reject a pending user registration with a required reason.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $currentUser = $request->user();
        if (!$currentUser) {
            return $this->sendError('Unauthenticated.', [], 401);
        }
        if ($currentUser->role !== User::ROLE_ADMIN) {
            return $this->sendError('Akses ditolak. Hanya Administrator yang dapat menolak pendaftaran pengguna.', [], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return $this->sendError('Pengguna tidak ditemukan.', [], 404);
        }

        // Admin Protection: Cannot reject last active admin
        if ($user->role === User::ROLE_ADMIN) {
            $activeAdminCount = User::where('role', User::ROLE_ADMIN)
                ->where('status', User::STATUS_ACTIVE)
                ->count();

            if ($activeAdminCount <= 1) {
                return $this->sendError('Tidak dapat menolak Administrator terakhir.', [], 422);
            }
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'rejection_reason' => ['required', 'string', 'min:3', 'max:1000'],
        ], [
            'rejection_reason.required' => 'Alasan penolakan pendaftaran wajib diisi.',
            'rejection_reason.min'      => 'Alasan penolakan minimal 3 karakter.',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi penolakan gagal.', $validator->errors(), 422);
        }

        $user->update([
            'status'           => User::STATUS_REJECTED,
            'rejected_at'      => now(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'REJECT_USER',
            'Users',
            "Menolak pendaftaran pengguna {$user->name} ({$user->email}). Alasan: {$request->input('rejection_reason')}"
        );

        return $this->sendResponse(
            new UserResource($user),
            'Pendaftaran pengguna berhasil ditolak.'
        );
    }
}
