<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ClassResource;
use App\Models\Enrollment;
use App\Models\ProgramClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentClassController extends BaseApiController
{
    /**
     * Get classes enrolled by the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Active enrollments are the single source of truth for student class membership
        $classIds = Enrollment::where('user_id', $userId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->pluck('class_id');

        // Fail-closed: student with no active enrollment gets empty paginated collection
        if ($classIds->isEmpty()) {
            $classes = ProgramClass::whereRaw('1 = 0')->paginate(15);
            return $this->sendPaginated(
                $classes->through(fn ($item) => new ClassResource($item)),
                'Daftar kelas Anda berhasil dimuat.'
            );
        }

        $query = ProgramClass::with(['program', 'teacher'])
            ->whereIn('id', $classIds);

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(class_name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(instructor) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term]);
            });
        }

        $classes = $query->paginate(15);

        return $this->sendPaginated(
            $classes->through(fn ($item) => new ClassResource($item)),
            'Daftar kelas Anda berhasil dimuat.'
        );
    }

    /**
     * Get student's class schedule based on active enrollments.
     */
    public function schedule(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $classIds = Enrollment::where('user_id', $userId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->pluck('class_id');

        // Fail-closed: empty schedule if no active enrollment
        if ($classIds->isEmpty()) {
            return $this->sendResponse([], 'Jadwal belajar siswa berhasil dimuat.');
        }

        // Verify requested class_id belongs to active enrollments (IDOR Protection)
        if ($request->filled('class_id')) {
            $reqClassId = (int) $request->class_id;
            if (!$classIds->contains($reqClassId)) {
                return $this->sendError('Akses ditolak. Anda tidak terdaftar aktif pada kelas ini.', [], 403);
            }
        }

        // Check for specific session schedules
        $sessionQuery = \App\Models\Schedule::whereIn('class_id', $classIds)
            ->with(['class.program', 'class.teacher']);

        if ($request->filled('class_id')) {
            $sessionQuery->where('class_id', (int) $request->class_id);
        }

        if ($request->filled('date')) {
            $sessionQuery->whereDate('date', $request->date);
        }

        $sessions = $sessionQuery->orderBy('date', 'asc')->orderBy('start_time', 'asc')->get();

        if ($sessions->isNotEmpty() || $request->has('sessions') || $request->filled('date')) {
            return $this->sendResponse(
                \App\Http\Resources\ScheduleResource::collection($sessions),
                'Jadwal belajar siswa berhasil dimuat.'
            );
        }

        $classes = ProgramClass::with(['program:id,title', 'teacher:id,name'])
            ->whereIn('id', $classIds)
            ->get();

        $scheduleList = $classes->map(fn ($c) => [
            'classId'      => $c->id,
            'className'    => $c->class_name ?? $c->name,
            'programTitle' => $c->program?->title,
            'instructor'   => $c->teacher?->name ?? $c->instructor,
            'level'        => $c->level,
            'schedule'     => $c->schedule,
            'location'     => $c->location,
            'startDate'    => $c->start_date?->format('Y-m-d'),
            'endDate'      => $c->end_date?->format('Y-m-d'),
            'status'       => $c->status,
        ]);

        return $this->sendResponse($scheduleList, 'Jadwal belajar siswa berhasil dimuat.');
    }

    /**
     * Get specific enrolled class details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $class = ProgramClass::with(['program', 'teacher'])->find($id);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        // Verify active enrollment (FAIL CLOSED)
        $isEnrolled = Enrollment::where('user_id', $userId)
            ->where('class_id', $id)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();

        if (!$isEnrolled) {
            return $this->sendError('Akses ditolak. Anda tidak terdaftar pada kelas ini.', [], 403);
        }

        return $this->sendResponse(new ClassResource($class), 'Detail kelas berhasil dimuat.');
    }
}
