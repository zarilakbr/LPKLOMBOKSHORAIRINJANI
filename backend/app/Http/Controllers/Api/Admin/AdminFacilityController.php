<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreFacilityRequest;
use App\Http\Resources\FacilityResource;
use App\Models\Facility;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFacilityController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Facility::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $facilities = $query->orderBy('order', 'asc')->paginate(15);

        return $this->sendPaginated($facilities, 'Daftar fasilitas pelatihan berhasil dimuat.');
    }

    public function store(StoreFacilityRequest $request): JsonResponse
    {
        $facility = Facility::create($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Facilities',
            "Menambahkan fasilitas: {$facility->name}."
        );

        return $this->sendResponse(
            new FacilityResource($facility),
            'Fasilitas berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return $this->sendError('Fasilitas tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new FacilityResource($facility),
            'Detail fasilitas berhasil dimuat.'
        );
    }

    public function update(StoreFacilityRequest $request, int $id): JsonResponse
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return $this->sendError('Fasilitas tidak ditemukan.', [], 404);
        }

        $facility->update($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Facilities',
            "Memperbarui fasilitas: {$facility->name}."
        );

        return $this->sendResponse(
            new FacilityResource($facility),
            'Data fasilitas berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return $this->sendError('Fasilitas tidak ditemukan.', [], 404);
        }

        $name = $facility->name;
        $facility->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Facilities',
            "Menghapus fasilitas: {$name}."
        );

        return $this->sendResponse(null, 'Fasilitas berhasil dihapus.');
    }
}
