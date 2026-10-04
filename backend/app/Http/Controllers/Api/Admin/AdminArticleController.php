<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreArticleRequest;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use App\Services\ActivityLogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminArticleController extends BaseApiController
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Article::query();

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(category) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(author) LIKE ?', [$term]);
            });
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        $articles = $query->orderBy('created_at', 'desc')->paginate(15);

        return $this->sendPaginated($articles, 'Daftar artikel CMS berhasil dimuat.');
    }

    public function store(StoreArticleRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        if ($data['status'] === 'PUBLISHED' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $article = Article::create($data);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'CREATE',
            'Articles',
            "Membuat artikel baru: {$article->title}."
        );

        return $this->sendResponse(
            new ArticleResource($article),
            'Artikel berhasil diterbitkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return $this->sendError('Artikel tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new ArticleResource($article),
            'Detail artikel berhasil dimuat.'
        );
    }

    public function update(StoreArticleRequest $request, int $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return $this->sendError('Artikel tidak ditemukan.', [], 404);
        }

        $data = $request->validated();
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }
        if ($data['status'] === 'PUBLISHED' && empty($article->published_at)) {
            $data['published_at'] = now();
        }

        $article->update($data);

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'UPDATE',
            'Articles',
            "Memperbarui artikel: {$article->title}."
        );

        return $this->sendResponse(
            new ArticleResource($article),
            'Data artikel berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $article = Article::find($id);

        if (!$article) {
            return $this->sendError('Artikel tidak ditemukan.', [], 404);
        }

        $title = $article->title;
        $article->delete();

        $this->activityLogService->log(
            $request->user()?->id,
            $request->user()?->name,
            'DELETE',
            'Articles',
            "Menghapus artikel: {$title}."
        );

        return $this->sendResponse(null, 'Artikel berhasil dihapus.');
    }
}
