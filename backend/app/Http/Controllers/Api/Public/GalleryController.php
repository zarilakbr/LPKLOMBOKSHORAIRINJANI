<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\GalleryResource;
use App\Models\Gallery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends BaseApiController
{
    /**
     * Display a listing of gallery items.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Gallery::query()->where('status', 'ACTIVE')->orderBy('order', 'asc');

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        $items = $query->get();

        return $this->sendResponse(
            GalleryResource::collection($items),
            'Galeri aktivitas dan pelatihan berhasil dimuat.'
        );
    }
}
