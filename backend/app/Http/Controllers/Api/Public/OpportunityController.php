<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\OpportunityResource;
use App\Models\Opportunity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpportunityController extends BaseApiController
{
    /**
     * Display a listing of open job opportunities in Japan.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Opportunity::query()->where('status', 'OPEN')->orderBy('created_at', 'desc');

        if ($request->has('sector') && $request->sector !== 'ALL') {
            $query->where('sector', $request->sector);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(sector) LIKE ?', [$term]);
            });
        }

        $opportunities = $query->get();

        return $this->sendResponse(
            OpportunityResource::collection($opportunities),
            'Daftar peluang kerja di Jepang berhasil dimuat.'
        );
    }

    /**
     * Display the specified job opportunity by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $opportunity = Opportunity::where('slug', $slug)->first();

        if (!$opportunity) {
            return $this->sendError('Peluang kerja tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new OpportunityResource($opportunity),
            'Detail peluang kerja berhasil dimuat.'
        );
    }
}
