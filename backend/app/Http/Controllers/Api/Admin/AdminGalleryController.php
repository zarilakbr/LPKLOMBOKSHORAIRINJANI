<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreGalleryRequest;
use App\Http\Resources\GalleryResource;
use App\Models\Gallery;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminGalleryController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Gallery::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $items = $query->orderBy('order', 'asc')->paginate(15);

        return $this->sendPaginated($items, 'Daftar item galeri berhasil dimuat.');
    }

    public function store(StoreGalleryRequest $request): JsonResponse
    {
        $item = Gallery::create($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Gallery',
            "Menambahkan foto galeri: {$item->title}."
        );

        return $this->sendResponse(
            new GalleryResource($item),
            'Foto galeri berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $item = Gallery::find($id);

        if (!$item) {
            return $this->sendError('Item galeri tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new GalleryResource($item),
            'Detail item galeri berhasil dimuat.'
        );
    }

    public function update(StoreGalleryRequest $request, int $id): JsonResponse
    {
        $item = Gallery::find($id);

        if (!$item) {
            return $this->sendError('Item galeri tidak ditemukan.', [], 404);
        }

        $item->update($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Gallery',
            "Memperbarui item galeri: {$item->title}."
        );

        return $this->sendResponse(
            new GalleryResource($item),
            'Data galeri berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $item = Gallery::find($id);

        if (!$item) {
            return $this->sendError('Item galeri tidak ditemukan.', [], 404);
        }

        $title = $item->title;
        $item->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Gallery',
            "Menghapus item galeri: {$title}."
        );

        return $this->sendResponse(null, 'Item galeri berhasil dihapus.');
    }
}
