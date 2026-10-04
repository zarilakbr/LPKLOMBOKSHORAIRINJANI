<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\ScheduleCreated;
use App\Events\ScheduleDeleted;
use App\Events\ScheduleUpdated;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreScheduleRequest;
use App\Http\Requests\UpdateScheduleRequest;
use App\Http\Resources\ScheduleResource;
use App\Models\ProgramClass;
use App\Models\Schedule;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminScheduleController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Schedule::with(['class.program', 'class.teacher']);

        if ($request->filled('class_id') && $request->class_id !== 'ALL') {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term])
                  ->orWhereHas('class', function ($cq) use ($term) {
                      $cq->whereRaw('LOWER(name) LIKE ?', [$term])
                         ->orWhereRaw('LOWER(class_name) LIKE ?', [$term]);
                  });
            });
        }

        $schedules = $query->orderBy('date', 'desc')
            ->orderBy('start_time', 'asc')
            ->paginate(15);

        return $this->sendPaginated(
            $schedules->through(fn ($item) => new ScheduleResource($item)),
            'Daftar jadwal sesi pelatihan berhasil dimuat.'
        );
    }

    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $class = ProgramClass::findOrFail($validated['class_id']);

        $schedule = Schedule::create([
            'class_id'   => $class->id,
            'title'      => $validated['title'],
            'date'       => $validated['date'],
            'start_time' => $validated['start_time'],
            'end_time'   => $validated['end_time'],
            'location'   => $validated['location'] ?? $class->location,
            'status'     => $validated['status'] ?? Schedule::STATUS_SCHEDULED,
            'notes'      => $validated['notes'] ?? null,
        ]);

        $loadedSchedule = $schedule->load(['class.program', 'class.teacher']);

        event(new ScheduleCreated($loadedSchedule));

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Schedules',
            "Admin menambahkan sesi jadwal baru: {$schedule->title} pada {$schedule->date->format('Y-m-d')}."
        );

        return $this->sendResponse(
            new ScheduleResource($loadedSchedule),
            'Sesi jadwal kelas berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $schedule = Schedule::with(['class.program', 'class.teacher'])->find($id);

        if (!$schedule) {
            return $this->sendError('Jadwal tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(new ScheduleResource($schedule), 'Detail jadwal berhasil dimuat.');
    }

    public function update(UpdateScheduleRequest $request, int $id): JsonResponse
    {
        $schedule = Schedule::with('class')->find($id);

        if (!$schedule) {
            return $this->sendError('Jadwal tidak ditemukan.', [], 404);
        }

        $schedule->update($request->validated());
        $freshSchedule = $schedule->fresh(['class.program', 'class.teacher']);

        event(new ScheduleUpdated($freshSchedule));

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Schedules',
            "Admin memperbarui jadwal ID {$schedule->id}: {$schedule->title}."
        );

        return $this->sendResponse(
            new ScheduleResource($freshSchedule),
            'Sesi jadwal kelas berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return $this->sendError('Jadwal tidak ditemukan.', [], 404);
        }

        $scheduleId = $schedule->id;
        $classId = $schedule->class_id;
        $title = $schedule->title;

        $schedule->delete();

        event(new ScheduleDeleted($scheduleId, $classId, $title));

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Schedules',
            "Admin menghapus jadwal ID {$scheduleId}: {$title}."
        );

        return $this->sendResponse(null, 'Sesi jadwal kelas berhasil dihapus.');
    }
}
