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
        $query = ProgramClass::with(['program', 'teacher']);

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(class_name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(instructor) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term]);
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
        $data = $request->validated();

        if (!empty($data['teacher_id'])) {
            $teacher = \App\Models\User::where('id', $data['teacher_id'])->where('role', \App\Models\User::ROLE_PENGAJAR)->first();
            if ($teacher) {
                $data['instructor'] = $teacher->name;
            }
        }

        $class = ProgramClass::create($data);
        $loadedClass = $class->load(['program', 'teacher']);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Classes',
            "Menambahkan kelas baru: {$loadedClass->class_name}."
        );

        event(new \App\Events\ClassCreated($loadedClass));

        return $this->sendResponse(
            new ClassResource($loadedClass),
            'Kelas berhasil dibuat.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $class = ProgramClass::with(['program', 'teacher'])->find($id);

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

        $previousTeacherId = $class->teacher_id;
        $data = $request->validated();

        if (array_key_exists('teacher_id', $data) && !empty($data['teacher_id'])) {
            $teacher = \App\Models\User::where('id', $data['teacher_id'])->where('role', \App\Models\User::ROLE_PENGAJAR)->first();
            if ($teacher) {
                $data['instructor'] = $teacher->name;
            }
        }

        $class->update($data);
        $freshClass = $class->fresh(['program', 'teacher']);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Classes',
            "Memperbarui data kelas: {$freshClass->class_name}."
        );

        // Realtime Event Broadcast (Correct ClassUpdated event)
        event(new \App\Events\ClassUpdated($freshClass, $previousTeacherId));

        // Realtime Notification for Enrolled Students
        $className = $freshClass->class_name ?? $freshClass->name;
        \App\Services\RealtimeNotificationService::notifyClassStudents(
            $freshClass->id,
            'jadwal',
            'Jadwal Kelas Diperbarui',
            "Informasi jadwal/ruang kelas {$className} telah diperbarui oleh Admin.",
            '/dashboard/schedule'
        );

        return $this->sendResponse(
            new ClassResource($freshClass),
            'Data kelas berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $class = ProgramClass::find($id);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        $name = $class->class_name ?? $class->name;
        $classId = $class->id;
        $teacherId = $class->teacher_id;

        $class->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Classes',
            "Menghapus kelas: {$name}."
        );

        event(new \App\Events\ClassDeleted($classId, $teacherId, $name));

        return $this->sendResponse(null, 'Kelas berhasil dihapus.');
    }
}
