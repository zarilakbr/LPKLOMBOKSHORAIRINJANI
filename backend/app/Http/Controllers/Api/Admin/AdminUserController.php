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

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%");
            });
        }

        if ($request->has('role') && $request->role !== 'ALL') {
            $query->where('role', $request->role);
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $users = $query->orderBy('id', 'desc')->paginate(15);

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
        $user = User::find($id);

        if (!$user) {
            return $this->sendError('Pengguna tidak ditemukan.', [], 404);
        }

        if ($request->user()?->id === $user->id) {
            return $this->sendError('Anda tidak dapat menghapus akun Anda sendiri.', [], 400);
        }

        $name = $user->name;
        $user->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Users',
            "Menghapus akses pengguna admin: {$name}."
        );

        return $this->sendResponse(null, 'Pengguna berhasil dihapus.');
    }
}
