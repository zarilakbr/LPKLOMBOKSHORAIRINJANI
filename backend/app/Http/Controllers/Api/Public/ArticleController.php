<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArticleController extends BaseApiController
{
    /**
     * Display a listing of published news and articles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Article::query()->where('status', 'PUBLISHED')->orderBy('published_at', 'desc');

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(excerpt) LIKE ?', [$term]);
            });
        }

        $articles = $query->paginate(9);

        return $this->sendPaginated($articles, 'Daftar artikel dan panduan berhasil dimuat.');
    }

    /**
     * Display the specified article by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $article = Article::where('slug', $slug)->first();

        if (!$article) {
            return $this->sendError('Artikel atau berita tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new ArticleResource($article),
            'Detail artikel berhasil dimuat.'
        );
    }
}
