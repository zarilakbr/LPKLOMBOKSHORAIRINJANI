<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreOpportunityRequest;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminOpportunityController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Opportunity::query();

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(sector) LIKE ?', [$term]);
            });
        }

        if ($request->has('sector') && $request->sector !== 'ALL') {
            $query->where('sector', $request->sector);
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $opportunities = $query->orderBy('created_at', 'desc')->paginate(15);

        return $this->sendPaginated($opportunities, 'Daftar lowongan kerja berhasil dimuat.');
    }

    public function store(StoreOpportunityRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $opp = Opportunity::create($data);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Opportunities',
            "Menambahkan lowongan kerja: {$opp->title}."
        );

        return $this->sendResponse(
            new OpportunityResource($opp),
            'Lowongan kerja berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $opp = Opportunity::find($id);

        if (!$opp) {
            return $this->sendError('Lowongan kerja tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new OpportunityResource($opp),
            'Detail lowongan kerja berhasil dimuat.'
        );
    }

    public function update(StoreOpportunityRequest $request, int $id): JsonResponse
    {
        $opp = Opportunity::find($id);

        if (!$opp) {
            return $this->sendError('Lowongan kerja tidak ditemukan.', [], 404);
        }

        $data = $request->validated();
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $opp->update($data);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Opportunities',
            "Memperbarui lowongan kerja: {$opp->title}."
        );

        return $this->sendResponse(
            new OpportunityResource($opp),
            'Data lowongan kerja berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $opp = Opportunity::find($id);

        if (!$opp) {
            return $this->sendError('Lowongan kerja tidak ditemukan.', [], 404);
        }

        $title = $opp->title;
        $opp->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Opportunities',
            "Menghapus lowongan kerja: {$title}."
        );

        return $this->sendResponse(null, 'Lowongan kerja berhasil dihapus.');
    }
}
