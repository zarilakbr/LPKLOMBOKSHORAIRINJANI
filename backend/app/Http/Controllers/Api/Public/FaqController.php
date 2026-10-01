<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FaqController extends BaseApiController
{
    /**
     * Display a listing of FAQs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Faq::query()->where('status', 'ACTIVE')->orderBy('order', 'asc');

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        $faqs = $query->get();

        return $this->sendResponse(
            FaqResource::collection($faqs),
            'Daftar FAQ berhasil dimuat.'
        );
    }
}
