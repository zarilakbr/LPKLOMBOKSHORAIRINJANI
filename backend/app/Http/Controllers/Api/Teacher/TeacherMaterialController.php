<?php

namespace App\Http\Controllers\Api\Teacher;

use App\Events\MaterialCreated;
use App\Events\MaterialDeleted;
use App\Events\MaterialUpdated;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Teacher\StoreMaterialRequest;
use App\Http\Requests\Teacher\UpdateMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Models\ProgramClass;
use App\Services\RealtimeNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TeacherMaterialController extends BaseApiController
{
    /**
     * Get all materials for classes assigned to the authenticated teacher.
     */
    public function index(Request $request): JsonResponse
    {
        $teacherId = $request->user()->id;

        // Query only classes assigned to the authenticated teacher
        $teacherClassIds = ProgramClass::where('teacher_id', $teacherId)->pluck('id');

        $query = Material::whereIn('class_id', $teacherClassIds)
            ->with(['class', 'teacher']);

        // Filter by class_id if requested (must belong to this teacher)
        if ($request->filled('class_id') && $request->class_id !== 'ALL') {
            $classId = (int) $request->class_id;
            if (!$teacherClassIds->contains($classId)) {
                return $this->sendError('Akses ditolak. Anda tidak memiliki akses ke kelas ini.', [], 403);
            }
            $query->where('class_id', $classId);
        }

        // Filter by publication status
        if ($request->filled('is_published') && $request->is_published !== 'ALL') {
            $isPub = filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_published', $isPub);
        }

        // Filter by type
        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', $request->type);
        }

        // Search by title or description
        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(description) LIKE ?', [$term]);
            });
        }

        $materials = $query->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated(
            $materials->through(fn ($item) => new MaterialResource($item)),
            'Daftar materi pembelajaran kelas berhasil dimuat.'
        );
    }

    /**
     * Store a newly created learning material.
     */
    public function store(StoreMaterialRequest $request): JsonResponse
    {
        $teacherId = $request->user()->id;
        $validated = $request->validated();
        $classId = (int) $validated['class_id'];

        // Strict Server-Side Ownership Check: Selected class must belong to authenticated teacher
        $class = ProgramClass::where('id', $classId)
            ->where('teacher_id', $teacherId)
            ->first();

        if (!$class) {
            return $this->sendError('Akses ditolak. Anda hanya dapat menambahkan materi untuk kelas bimbingan Anda.', [], 403);
        }

        $filePath = null;
        $originalFilename = null;
        $mimeType = null;
        $fileSize = null;

        // Secure file upload handling
        if ($request->hasFile('file') && $validated['type'] === Material::TYPE_FILE) {
            $uploadedFile = $request->file('file');
            $filePath = $uploadedFile->store('materials', 'local');
            $originalFilename = $uploadedFile->getClientOriginalName();
            $mimeType = $uploadedFile->getClientMimeType() ?: $uploadedFile->getMimeType();
            $fileSize = $uploadedFile->getSize();
        }

        $isPublished = isset($validated['is_published']) ? filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN) : false;
        $publishedAt = $isPublished ? now() : null;

        $material = Material::create([
            'class_id'          => $classId,
            'teacher_id'        => $teacherId, // Strictly server-enforced teacher ID
            'title'             => $validated['title'],
            'description'       => $validated['description'] ?? null,
            'type'              => $validated['type'],
            'file_path'         => $filePath,
            'original_filename' => $originalFilename,
            'mime_type'         => $mimeType,
            'file_size'         => $fileSize,
            'external_url'      => $validated['external_url'] ?? null,
            'is_published'      => $isPublished,
            'published_at'      => $publishedAt,
        ]);

        $loadedMaterial = $material->load(['class', 'teacher']);

        // Broadcast Realtime Event
        event(new MaterialCreated($loadedMaterial));

        // Realtime Notification for active students if published
        if ($isPublished) {
            $className = $class->class_name ?? $class->name;
            RealtimeNotificationService::notifyClassStudents(
                $classId,
                'materi',
                'Materi Pembelajaran Baru',
                "Sensei telah menerbitkan materi baru: {$material->title} untuk kelas {$className}.",
                '/dashboard/materials'
            );
        }

        return $this->sendResponse(
            new MaterialResource($loadedMaterial),
            'Materi pembelajaran berhasil ditambahkan.',
            201
        );
    }

    /**
     * Display the specified learning material.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $material = Material::with(['class', 'teacher'])->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        // Strict Ownership Authorization (IDOR Protection)
        if ($material->teacher_id !== $teacherId || $material->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki akses ke materi kelas ini.', [], 403);
        }

        return $this->sendResponse(new MaterialResource($material), 'Detail materi pembelajaran berhasil dimuat.');
    }

    /**
     * Update the specified learning material.
     */
    public function update(UpdateMaterialRequest $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $material = Material::with(['class', 'teacher'])->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        // Strict Ownership Authorization (IDOR Protection)
        if ($material->teacher_id !== $teacherId || $material->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk mengubah materi ini.', [], 403);
        }

        $validated = $request->validated();

        // If class_id is modified, verify ownership of the new class
        if (isset($validated['class_id']) && (int) $validated['class_id'] !== $material->class_id) {
            $newClassId = (int) $validated['class_id'];
            $newClass = ProgramClass::where('id', $newClassId)->where('teacher_id', $teacherId)->exists();
            if (!$newClass) {
                return $this->sendError('Akses ditolak. Kelas tujuan bukan kelas bimbingan Anda.', [], 403);
            }
            $material->class_id = $newClassId;
        }

        if (isset($validated['title'])) {
            $material->title = $validated['title'];
        }

        if (array_key_exists('description', $validated)) {
            $material->description = $validated['description'];
        }

        if (isset($validated['type'])) {
            $material->type = $validated['type'];
        }

        if (array_key_exists('external_url', $validated)) {
            $material->external_url = $validated['external_url'];
        }

        // Handle file update if a new file is uploaded
        if ($request->hasFile('file')) {
            // Delete old file if present
            if ($material->file_path && Storage::disk('local')->exists($material->file_path)) {
                Storage::disk('local')->delete($material->file_path);
            }

            $uploadedFile = $request->file('file');
            $material->file_path = $uploadedFile->store('materials', 'local');
            $material->original_filename = $uploadedFile->getClientOriginalName();
            $material->mime_type = $uploadedFile->getClientMimeType() ?: $uploadedFile->getMimeType();
            $material->file_size = $uploadedFile->getSize();
        }

        // Publication toggle & timestamps
        $wasPublished = (bool) $material->is_published;
        if (array_key_exists('is_published', $validated)) {
            $newPublished = filter_var($validated['is_published'], FILTER_VALIDATE_BOOLEAN);
            $material->is_published = $newPublished;
            if ($newPublished && !$wasPublished) {
                $material->published_at = now();
            }
        }

        $material->save();

        $loadedMaterial = $material->fresh(['class', 'teacher']);

        // Broadcast Realtime Update
        event(new MaterialUpdated($loadedMaterial));

        // Notify active students if newly published
        if ($material->is_published && !$wasPublished) {
            $className = $loadedMaterial->class?->class_name ?? $loadedMaterial->class?->name;
            RealtimeNotificationService::notifyClassStudents(
                $loadedMaterial->class_id,
                'materi',
                'Materi Pembelajaran Diterbitkan',
                "Sensei telah menerbitkan materi: {$material->title} untuk kelas {$className}.",
                '/dashboard/materials'
            );
        }

        return $this->sendResponse(
            new MaterialResource($loadedMaterial),
            'Materi pembelajaran berhasil diperbarui.'
        );
    }

    /**
     * Remove the specified learning material from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $teacherId = $request->user()->id;

        $material = Material::with('class')->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        // Strict Ownership Authorization
        if ($material->teacher_id !== $teacherId || $material->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk menghapus materi ini.', [], 403);
        }

        $materialId = $material->id;
        $classId = $material->class_id;
        $title = $material->title;

        // Delete physical file
        if ($material->file_path && Storage::disk('local')->exists($material->file_path)) {
            Storage::disk('local')->delete($material->file_path);
        }

        $material->delete();

        // Broadcast Realtime Deletion
        event(new MaterialDeleted($materialId, $classId, $title));

        return $this->sendResponse(null, 'Materi pembelajaran berhasil dihapus.');
    }

    /**
     * Securely download material file (strictly authorized).
     */
    public function download(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $teacherId = $request->user()->id;

        $material = Material::with('class')->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        // Strict Ownership Check (IDOR Protection)
        if ($material->teacher_id !== $teacherId || $material->class?->teacher_id !== $teacherId) {
            return $this->sendError('Akses ditolak. Anda tidak memiliki izin mengunduh materi ini.', [], 403);
        }

        if (!$material->file_path) {
            return $this->sendError('Materi ini tidak memiliki file berkas.', [], 404);
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
