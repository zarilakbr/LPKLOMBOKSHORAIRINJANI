<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ClassResource;
use App\Models\ProgramClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherClassController extends BaseApiController
{
    public function __construct(
        protected \App\Services\ActivityLogService $activityLogService
    ) {}

    /**
     * Get all classes assigned to the authenticated teacher.
     */
    public function index(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        $query = ProgramClass::where('teacher_id', $teacherId)
            ->with(['program', 'teacher'])
            ->orderBy('id', 'desc');

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(class_name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term]);
            });
        }

        $classes = $query->paginate(15);

        return $this->sendPaginated(
            $classes->through(fn ($item) => new ClassResource($item)),
            'Daftar kelas bimbingan Anda berhasil dimuat.'
        );
    }

    /**
     * Store a new class created directly by the authenticated teacher.
     */
    public function store(\App\Http\Requests\Teacher\StoreTeacherClassRequest $request): JsonResponse
    {
        $teacher = $request->user();
        $data = $request->validated();

        // Security rule: Force teacher_id to authenticated user, ignore any frontend payload
        $data['teacher_id'] = $teacher->id;
        $data['instructor'] = $teacher->name;
        $data['status'] = $data['status'] ?? 'OPEN';
        $data['current_students'] = 0;

        $class = ProgramClass::create($data);
        $loadedClass = $class->load(['program', 'teacher']);

        $this->activityLogService->log(
            $teacher->id,
            $teacher->name,
            'CREATE',
            'Classes',
            "Pengajar {$teacher->name} membuat kelas bimbingan baru: {$loadedClass->class_name}."
        );

        event(new \App\Events\ClassCreated($loadedClass));

        return $this->sendResponse(
            new ClassResource($loadedClass),
            'Kelas bimbingan berhasil dibuat.',
            201
        );
    }

    /**
     * Get detail of a specific class assigned to this teacher.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $class = ProgramClass::with(['program', 'teacher'])->find($id);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        // Strict Resource Ownership Check (IDOR Protection)
        if ($class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda bukan pengajar yang ditugaskan pada kelas ini.', [], 403);
        }

        return $this->sendResponse(new ClassResource($class), 'Detail kelas berhasil dimuat.');
    }

    /**
     * Update a class owned by the authenticated teacher.
     */
    public function update(\App\Http\Requests\Teacher\UpdateTeacherClassRequest $request, int $id): JsonResponse
    {
        $teacher = $request->user();
        $class = ProgramClass::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$class) {
            return $this->sendError('Akses ditolak. Anda hanya dapat mengubah kelas bimbingan milik Anda sendiri.', [], 403);
        }

        $data = $request->validated();
        // Strictly prevent changing teacher_id
        unset($data['teacher_id']);
        $data['instructor'] = $teacher->name;

        $class->update($data);
        $freshClass = $class->fresh(['program', 'teacher']);

        $this->activityLogService->log(
            $teacher->id,
            $teacher->name,
            'UPDATE',
            'Classes',
            "Pengajar {$teacher->name} memperbarui kelas bimbingan: {$freshClass->class_name}."
        );

        event(new \App\Events\ClassUpdated($freshClass));

        return $this->sendResponse(
            new ClassResource($freshClass),
            'Data kelas bimbingan berhasil diperbarui.'
        );
    }

    /**
     * Delete a class owned by the authenticated teacher.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $teacher = $request->user();
        $class = ProgramClass::where('id', $id)
            ->where('teacher_id', $teacher->id)
            ->first();

        if (!$class) {
            return $this->sendError('Akses ditolak. Anda hanya dapat menghapus kelas bimbingan milik Anda sendiri.', [], 403);
        }

        $className = $class->class_name ?? $class->name;
        $classId = $class->id;
        $class->delete();

        $this->activityLogService->log(
            $teacher->id,
            $teacher->name,
            'DELETE',
            'Classes',
            "Pengajar {$teacher->name} menghapus kelas bimbingan: {$className}."
        );

        event(new \App\Events\ClassDeleted($classId, $teacher->id, $className));

        return $this->sendResponse(null, 'Kelas bimbingan berhasil dihapus.');
    }

    /**
     * Get teaching schedule for the authenticated teacher.
     */
    public function schedule(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        $teacherClassIds = ProgramClass::where('teacher_id', $teacherId)->pluck('id');

        // Check if detailed session schedules are queried or present
        $sessionQuery = \App\Models\Schedule::whereIn('class_id', $teacherClassIds)
            ->with(['class.program', 'class.teacher']);

        if ($request->filled('class_id') && $request->class_id !== 'ALL') {
            $classId = (int) $request->class_id;
            if (!$teacherClassIds->contains($classId)) {
                return $this->sendError('Akses ditolak. Kelas bukan kelas bimbingan Anda.', [], 403);
            }
            $sessionQuery->where('class_id', $classId);
        }

        if ($request->filled('date')) {
            $sessionQuery->whereDate('date', $request->date);
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            $sessionQuery->where('status', $request->status);
        }

        $sessions = $sessionQuery->orderBy('date', 'asc')->orderBy('start_time', 'asc')->get();

        if ($sessions->isNotEmpty() || $request->has('sessions') || $request->filled('date')) {
            return $this->sendResponse(
                \App\Http\Resources\ScheduleResource::collection($sessions),
                'Jadwal sesi mengajar berhasil dimuat.'
            );
        }

        // Fallback to class-level schedule overview
        $classes = ProgramClass::where('teacher_id', $teacherId)
            ->with('program:id,title')
            ->orderBy('id', 'asc')
            ->get();

        $scheduleList = $classes->map(fn ($c) => [
            'classId'         => $c->id,
            'className'       => $c->name,
            'programTitle'    => $c->program?->title,
            'level'           => $c->level,
            'schedule'        => $c->schedule,
            'location'        => $c->location,
            'capacity'        => $c->capacity,
            'currentStudents' => $c->current_students,
            'startDate'       => $c->start_date?->format('Y-m-d'),
            'endDate'         => $c->end_date?->format('Y-m-d'),
            'status'          => $c->status,
        ]);

        return $this->sendResponse($scheduleList, 'Jadwal mengajar berhasil dimuat.');
    }

    /**
     * Store a new class session schedule (teacher creates schedule for own class).
     */
    public function storeSchedule(\App\Http\Requests\StoreScheduleRequest $request): JsonResponse
    {
        $teacherId = $request->user()->id;
        $validated = $request->validated();
        $classId = (int) $validated['class_id'];

        $class = ProgramClass::where('id', $classId)
            ->where('teacher_id', $teacherId)
            ->first();

        if (!$class) {
            return $this->sendError('Akses ditolak. Anda hanya dapat mengatur jadwal untuk kelas bimbingan Anda.', [], 403);
        }

        $schedule = \App\Models\Schedule::create([
            'class_id'   => $classId,
            'title'      => $validated['title'],
            'date'       => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time'   => $validated['end_time'],
            'location'   => $validated['location'] ?? $class->location,
            'status'     => $validated['status'] ?? \App\Models\Schedule::STATUS_SCHEDULED,
            'notes'      => $validated['notes'] ?? null,
        ]);

        $loadedSchedule = $schedule->load(['class.program', 'class.teacher']);

        event(new \App\Events\ScheduleCreated($loadedSchedule));

        return $this->sendResponse(
            new \App\Http\Resources\ScheduleResource($loadedSchedule),
            'Sesi jadwal kelas berhasil ditambahkan.',
            201
        );
    }

    /**
     * Show a specific schedule session.
     */
    public function showSchedule(Request $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $schedule = \App\Models\Schedule::with(['class.program', 'class.teacher'])->find($id);

        if (!$schedule) {
            return $this->sendError('Jadwal tidak ditemukan.', [], 404);
        }

        if ($schedule->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda bukan pengajar untuk jadwal kelas ini.', [], 403);
        }

        return $this->sendResponse(new \App\Http\Resources\ScheduleResource($schedule), 'Detail jadwal berhasil dimuat.');
    }

    /**
     * Update an existing schedule session.
     */
    public function updateSchedule(\App\Http\Requests\UpdateScheduleRequest $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $schedule = \App\Models\Schedule::with('class')->find($id);

        if (!$schedule) {
            return $this->sendError('Jadwal tidak ditemukan.', [], 404);
        }

        if ($schedule->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak mengubah jadwal pada kelas pengajar lain.', [], 403);
        }

        $validated = $request->validated();
        if (isset($validated['class_id']) && (int) $validated['class_id'] !== $schedule->class_id) {
            $newClass = ProgramClass::where('id', $validated['class_id'])->where('teacher_id', $teacherId)->exists();
            if (!$newClass) {
                return $this->sendError('Akses ditolak. Kelas tujuan bukan kelas bimbingan Anda.', [], 403);
            }
        }

        $schedule->update($validated);
        $freshSchedule = $schedule->fresh(['class.program', 'class.teacher']);

        event(new \App\Events\ScheduleUpdated($freshSchedule));

        return $this->sendResponse(
            new \App\Http\Resources\ScheduleResource($freshSchedule),
            'Jadwal berhasil diperbarui.'
        );
    }

    /**
     * Delete an existing schedule session.
     */
    public function destroySchedule(Request $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $schedule = \App\Models\Schedule::with('class')->find($id);

        if (!$schedule) {
            return $this->sendError('Jadwal tidak ditemukan.', [], 404);
        }

        if ($schedule->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak menghapus jadwal pada kelas pengajar lain.', [], 403);
        }

        $scheduleId = $schedule->id;
        $classId = $schedule->class_id;
        $title = $schedule->title;

        $schedule->delete();

        event(new \App\Events\ScheduleDeleted($scheduleId, $classId, $title));

        return $this->sendResponse(null, 'Jadwal berhasil dihapus.');
    }
}
