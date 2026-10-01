<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreClassRequest;
use App\Http\Resources\ClassResource;
use App\Models\ProgramClass;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminClassController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = ProgramClass::with('program');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('class_name', 'like', "%{$search}%")
                  ->orWhere('instructor', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        $classes = $query->orderBy('start_date', 'asc')->paginate(15);

        return $this->sendPaginated($classes, 'Daftar kelas pelatihan berhasil dimuat.');
    }

    public function store(StoreClassRequest $request): JsonResponse
    {
        $class = ProgramClass::create($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Classes',
            "Menambahkan kelas baru: {$class->class_name}."
        );

        return $this->sendResponse(
            new ClassResource($class),
            'Kelas berhasil dibuat.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $class = ProgramClass::with('program')->find($id);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new ClassResource($class),
            'Detail kelas berhasil dimuat.'
        );
    }

    public function update(StoreClassRequest $request, int $id): JsonResponse
    {
        $class = ProgramClass::find($id);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        $class->update($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Classes',
            "Memperbarui data kelas: {$class->class_name}."
        );

        return $this->sendResponse(
            new ClassResource($class),
            'Data kelas berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $class = ProgramClass::find($id);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        $name = $class->class_name;
        $class->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Classes',
            "Menghapus kelas: {$name}."
        );

        return $this->sendResponse(null, 'Kelas berhasil dihapus.');
    }
}
