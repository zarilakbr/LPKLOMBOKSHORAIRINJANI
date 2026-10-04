<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreTestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTestimonialController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::query();

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(program) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(placement) LIKE ?', [$term]);
            });
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $testimonials = $query->orderBy('id', 'desc')->paginate(15);

        return $this->sendPaginated($testimonials, 'Daftar testimoni berhasil dimuat.');
    }

    public function store(StoreTestimonialRequest $request): JsonResponse
    {
        $testimonial = Testimonial::create($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Testimonials',
            "Menambahkan testimoni: {$testimonial->name}."
        );

        return $this->sendResponse(
            new TestimonialResource($testimonial),
            'Testimoni berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return $this->sendError('Testimoni tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new TestimonialResource($testimonial),
            'Detail testimoni berhasil dimuat.'
        );
    }

    public function update(StoreTestimonialRequest $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return $this->sendError('Testimoni tidak ditemukan.', [], 404);
        }

        $testimonial->update($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Testimonials',
            "Memperbarui testimoni: {$testimonial->name}."
        );

        return $this->sendResponse(
            new TestimonialResource($testimonial),
            'Data testimoni berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $testimonial = Testimonial::find($id);

        if (!$testimonial) {
            return $this->sendError('Testimoni tidak ditemukan.', [], 404);
        }

        $name = $testimonial->name;
        $testimonial->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Testimonials',
            "Menghapus testimoni: {$name}."
        );

        return $this->sendResponse(null, 'Testimoni berhasil dihapus.');
    }
}
