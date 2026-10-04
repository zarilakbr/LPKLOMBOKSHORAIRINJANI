<?php

namespace App\Http\Controllers\Api\Admin;

use App\Events\MaterialCreated;
use App\Events\MaterialDeleted;
use App\Events\MaterialUpdated;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Teacher\StoreMaterialRequest;
use App\Http\Requests\Teacher\UpdateMaterialRequest;
use App\Http\Resources\MaterialResource;
use App\Models\Material;
use App\Models\ProgramClass;
use App\Services\ActivityLogService;
use App\Services\RealtimeNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminMaterialController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Material::with(['class', 'teacher']);

        if ($request->filled('class_id') && $request->class_id !== 'ALL') {
            $query->where('class_id', $request->class_id);
        }

        if ($request->filled('teacher_id') && $request->teacher_id !== 'ALL') {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->filled('is_published') && $request->is_published !== 'ALL') {
            $isPub = filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN);
            $query->where('is_published', $isPub);
        }

        if ($request->filled('type') && $request->type !== 'ALL') {
            $query->where('type', $request->type);
        }

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
            'Daftar materi pembelajaran sistem berhasil dimuat.'
        );
    }

    public function store(StoreMaterialRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $class = ProgramClass::findOrFail($validated['class_id']);

        $teacherId = $class->teacher_id ?: $request->user()->id;

        $filePath = null;
        $originalFilename = null;
        $mimeType = null;
        $fileSize = null;

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
            'class_id'          => $class->id,
            'teacher_id'        => $teacherId,
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

        event(new MaterialCreated($loadedMaterial));

        if ($isPublished) {
            $className = $class->class_name ?? $class->name;
            RealtimeNotificationService::notifyClassStudents(
                $class->id,
                'materi',
                'Materi Pembelajaran Baru',
                "Materi baru '{$material->title}' telah diterbitkan untuk kelas {$className}.",
                '/dashboard/materials'
            );
        }

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Materials',
            "Admin menambahkan materi pembelajaran baru: {$material->title}."
        );

        return $this->sendResponse(
            new MaterialResource($loadedMaterial),
            'Materi pembelajaran berhasil ditambahkan oleh Admin.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $material = Material::with(['class', 'teacher'])->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(new MaterialResource($material), 'Detail materi pembelajaran berhasil dimuat.');
    }

    public function update(UpdateMaterialRequest $request, int $id): JsonResponse
    {
        $material = Material::with(['class', 'teacher'])->find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        $validated = $request->validated();

        if (isset($validated['class_id'])) {
            $material->class_id = (int) $validated['class_id'];
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

        if ($request->hasFile('file')) {
            if ($material->file_path && Storage::disk('local')->exists($material->file_path)) {
                Storage::disk('local')->delete($material->file_path);
            }

            $uploadedFile = $request->file('file');
            $material->file_path = $uploadedFile->store('materials', 'local');
            $material->original_filename = $uploadedFile->getClientOriginalName();
            $material->mime_type = $uploadedFile->getClientMimeType() ?: $uploadedFile->getMimeType();
            $material->file_size = $uploadedFile->getSize();
        }

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

        event(new MaterialUpdated($loadedMaterial));

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Materials',
            "Admin memperbarui materi pembelajaran ID {$material->id}: {$material->title}."
        );

        return $this->sendResponse(
            new MaterialResource($loadedMaterial),
            'Materi pembelajaran berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $material = Material::find($id);

        if (!$material) {
            return $this->sendError('Materi pembelajaran tidak ditemukan.', [], 404);
        }

        $materialId = $material->id;
        $classId = $material->class_id;
        $title = $material->title;

        if ($material->file_path && Storage::disk('local')->exists($material->file_path)) {
            Storage::disk('local')->delete($material->file_path);
        }

        $material->delete();

        event(new MaterialDeleted($materialId, $classId, $title));

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Materials',
            "Admin menghapus materi pembelajaran: {$title}."
        );

        return $this->sendResponse(null, 'Materi pembelajaran berhasil dihapus.');
    }

    public function download(int $id): StreamedResponse|JsonResponse
    {
        $material = Material::find($id);

        if (!$material || !$material->file_path) {
            return $this->sendError('Materi atau berkas dokumen tidak ditemukan.', [], 404);
        }

        $disk = Storage::disk('local')->exists($material->file_path) ? 'local' : (Storage::disk('public')->exists($material->file_path) ? 'public' : null);

        if (!$disk) {
            return $this->sendError('Berkas fisik materi tidak ditemukan pada server.', [], 404);
        }

        return Storage::disk($disk)->download(
            $material->file_path,
            $material->original_filename ?: basename($material->file_path)
        );
    }
}
