<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\FacilityResource;
use App\Models\Facility;
use Illuminate\Http\JsonResponse;

class FacilityController extends BaseApiController
{
    /**
     * Display a listing of campus facilities.
     */
    public function index(): JsonResponse
    {
        $facilities = Facility::where('status', 'ACTIVE')->orderBy('order', 'asc')->get();

        return $this->sendResponse(
            FacilityResource::collection($facilities),
            'Daftar fasilitas pelatihan berhasil dimuat.'
        );
    }
}
