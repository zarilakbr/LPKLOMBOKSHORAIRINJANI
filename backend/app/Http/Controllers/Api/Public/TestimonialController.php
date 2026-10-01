<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;

class TestimonialController extends BaseApiController
{
    /**
     * Display a listing of verified alumni testimonials.
     */
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::where('status', 'ACTIVE')->orderBy('id', 'asc')->get();

        return $this->sendResponse(
            TestimonialResource::collection($testimonials),
            'Testimoni alumni berhasil dimuat.'
        );
    }
}
