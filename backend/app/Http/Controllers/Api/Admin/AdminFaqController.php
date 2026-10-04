<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreFaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminFaqController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Faq::query();

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(question) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(answer) LIKE ?', [$term]);
            });
        }

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $faqs = $query->orderBy('order', 'asc')->paginate(15);

        return $this->sendPaginated($faqs, 'Daftar FAQ berhasil dimuat.');
    }

    public function store(StoreFaqRequest $request): JsonResponse
    {
        $faq = Faq::create($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'FAQs',
            "Menambahkan pertanyaan FAQ: {$faq->question}."
        );

        return $this->sendResponse(
            new FaqResource($faq),
            'FAQ berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return $this->sendError('FAQ tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new FaqResource($faq),
            'Detail FAQ berhasil dimuat.'
        );
    }

    public function update(StoreFaqRequest $request, int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return $this->sendError('FAQ tidak ditemukan.', [], 404);
        }

        $faq->update($request->validated());

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'FAQs',
            "Memperbarui FAQ: {$faq->question}."
        );

        return $this->sendResponse(
            new FaqResource($faq),
            'Data FAQ berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $faq = Faq::find($id);

        if (!$faq) {
            return $this->sendError('FAQ tidak ditemukan.', [], 404);
        }

        $q = $faq->question;
        $faq->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'FAQs',
            "Menghapus FAQ: {$q}."
        );

        return $this->sendResponse(null, 'FAQ berhasil dihapus.');
    }
}
