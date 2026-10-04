<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\MaterialResource;
use App\Models\Enrollment;
use App\Models\Material;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentMaterialController extends BaseApiController
{
    /**
     * Get learning materials available to the authenticated student.
     * STRICT RULE: ONLY materials from classes with ACTIVE enrollment and ONLY published materials.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Active enrollments are the SINGLE SOURCE OF TRUTH
        $activeClassIds = Enrollment::where('user_id', $userId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->pluck('class_id');

        // Fail-closed: student without active enrollment gets empty collection
        if ($activeClassIds->isEmpty()) {
            $materials = Material::whereRaw('1 = 0')->paginate(15);
            return $this->sendPaginated(
                $materials->through(fn ($item) => new MaterialResource($item)),
                'Daftar materi pembelajaran kelas berhasil dimuat.'
            );
        }

        $query = Material::whereIn('class_id', $activeClassIds)
            ->where('is_published', true)
            ->with(['class', 'teacher']);

        // Filter by class_id if requested
        if ($request->filled('class_id') && $request->class_id !== 'ALL') {
            $classId = (int) $request->class_id;

            // Fail-closed security check: verify student has ACTIVE enrollment in this requested class
            if (!$activeClassIds->contains($classId)) {
                return $this->sendError('Akses ditolak. Anda tidak memiliki akses ke materi kelas ini.', [], 403);
            }

            $query->where('class_id', $classId);
        }

        // Filter by type
        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', $request->type);
        }

        // Search in title or description
        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(description) LIKE ?', [$term]);
            });
        }

        $materials = $query->orderBy('published_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return $this->sendPaginated(
            $materials->through(fn ($item) => new MaterialResource($item)),
            'Daftar materi pembelajaran kelas berhasil dimuat.'
        );
    }

    /**
     * Display the specified learning material for student.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $request->user()->id;

        $material = Material::with(['class', 'teacher'])->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        // Unpublished materials are completely hidden from students
        if (!$material->is_published) {
            return $this->sendError('Materi pembelajaran tidak ditemukan atau belum diterbitkan.', [], 404);
        }

        // Strict Enrollment Membership Check (SINGLE SOURCE OF TRUTH & IDOR Protection)
        $isEnrolled = Enrollment::where('user_id', $userId)
            ->where('class_id', $material->class_id)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();

        if (!$isEnrolled) {
            return $this->sendError('Akses ditolak. Anda tidak terdaftar aktif pada kelas materi ini.', [], 403);
        }

        return $this->sendResponse(new MaterialResource($material), 'Detail materi pembelajaran berhasil dimuat.');
    }

    /**
     * Securely download material file for student.
     */
    public function download(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $userId = $request->user()->id;

        $material = Material::find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        // Unpublished materials cannot be downloaded by students
        if (!$material->is_published) {
            return $this->sendError('Materi pembelajaran tidak ditemukan atau belum diterbitkan.', [], 404);
        }

        // Strict Enrollment Authorization Check (IDOR Protection)
        $isEnrolled = Enrollment::where('user_id', $userId)
            ->where('class_id', $material->class_id)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();

        if (!$isEnrolled) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki akses untuk mengunduh materi kelas ini.', [], 403);
        }

        if (!$material->file_path) {
            return $this->sendError('Materi ini tidak memiliki berkas dokumen untuk diunduh.', [], 404);
        }

        $disk = Storage::disk('local')->exists($material->file_path) ? 'local' : (Storage::disk('public')->exists($material->file_path) ? 'public' : null);

        if (!$disk) {
            return $this->sendError('Berkas fisik materi tidak ditemukan pada server penyimpanan.', [], 404);
        }

        return Storage::disk($disk)->download(
            $material->file_path,
            $material->original_filename ?: basename($material->file_path)
        );
    }
}
