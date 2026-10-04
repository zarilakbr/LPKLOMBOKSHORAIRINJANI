<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherStudentController extends BaseApiController
{
    /**
     * Get all students enrolled across all classes taught by this teacher.
     */
    public function index(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        $teacherClassIds = ProgramClass::where('teacher_id', $teacherId)->pluck('id');

        // Source of Truth: Identify students with ACTIVE enrollments in teacher's classes
        $studentIds = Enrollment::whereIn('class_id', $teacherClassIds)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->pluck('user_id')
            ->unique();

        $studentQuery = User::whereIn('id', $studentIds)
            ->where('role', User::ROLE_SISWA)
            ->with('profile');

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $studentQuery->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(email) LIKE ?', [$term]);
            });
        }

        $students = $studentQuery->orderBy('name', 'asc')->paginate(15);

        $data = $students->getCollection()->map(fn ($s) => [
            'id'             => $s->id,
            'name'           => $s->name,
            'email'          => $s->email,
            'phone'          => $s->phone,
            'avatar'         => $s->avatar,
            'japaneseLevel'  => $s->profile?->japanese_level,
            'educationLevel' => $s->profile?->education_level,
            'city'           => $s->profile?->city,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Daftar siswa binaan berhasil dimuat.',
            'data'    => $data,
            'meta'    => [
                'current_page' => $students->currentPage(),
                'last_page'    => $students->lastPage(),
                'per_page'     => $students->perPage(),
                'total'        => $students->total(),
            ]
        ], 200);
    }

    /**
     * Get students enrolled in a specific class taught by this teacher.
     */
    public function classStudents(Request $request, int $classId): JsonResponse
    {
        $teacherId = $request->user()->id;

        $class = ProgramClass::find($classId);

        if (!$class) {
            return $this->sendError('Kelas tidak ditemukan.', [], 404);
        }

        // Strict Resource Ownership Check (IDOR Protection)
        if ($class->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda bukan pengajar kelas ini.', [], 403);
        }

        // Source of Truth: Students with ACTIVE enrollments in this class
        $studentIds = Enrollment::where('class_id', $classId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->pluck('user_id')
            ->unique();

        $students = User::whereIn('id', $studentIds)
            ->where('role', User::ROLE_SISWA)
            ->with('profile')
            ->orderBy('name', 'asc')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'name'          => $s->name,
                'email'         => $s->email,
                'phone'         => $s->phone,
                'avatar'        => $s->avatar,
                'japaneseLevel' => $s->profile?->japanese_level,
                'education'     => $s->profile?->education_level,
                'city'          => $s->profile?->city,
            ]);

        return $this->sendResponse([
            'class'    => [
                'id'        => $class->id,
                'name'      => $class->name,
                'level'     => $class->level,
                'schedule'  => $class->schedule,
            ],
            'students' => $students,
        ], 'Daftar siswa di kelas ini berhasil dimuat.');
    }
}
