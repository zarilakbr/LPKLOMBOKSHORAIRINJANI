<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\EnrollmentResource;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentEnrollmentController extends BaseApiController
{
    /**
     * Get all enrollments for the authenticated student.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = Enrollment::where('user_id', $userId)
            ->with(['class.teacher'])
            ->orderBy('id', 'desc');

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', strtoupper($request->status));
        }

        $enrollments = $query->paginate(15);

        return $this->sendPaginated(
            $enrollments->through(fn ($item) => new EnrollmentResource($item)),
            'Daftar pendaftaran kelas Anda berhasil dimuat.'
        );
    }

    /**
     * Get details of a specific enrollment belonging to the authenticated student.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $enrollment = Enrollment::with(['class.teacher'])->find($id);

        if (!$enrollment) {
            return $this->sendError('Data pendaftaran kelas tidak ditemukan.', [], 404);
        }

        // IDOR Protection: Student can only view their own enrollment
        if ($enrollment->user_id !== $userId) {
            return $this->sendError('Akses ditolak. Anda tidak berhak melihat data pendaftaran siswa lain.', [], 403);
        }

        return $this->sendResponse(
            new EnrollmentResource($enrollment),
            'Detail pendaftaran kelas berhasil dimuat.'
        );
    }
}
