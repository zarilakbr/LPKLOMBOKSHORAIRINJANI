<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProgramController extends BaseApiController
{
    /**
     * Display a listing of published programs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Program::query()->where('status', 'ACTIVE')->orderBy('order', 'asc');

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(short_description) LIKE ?', [$term]);
            });
        }

        $programs = $query->get();

        return $this->sendResponse(
            ProgramResource::collection($programs),
            'Daftar program pelatihan berhasil dimuat.'
        );
    }

    /**
     * Display the specified program by slug.
     */
    public function show(string $slug): JsonResponse
    {
        $program = Program::with('classes')->where('slug', $slug)->first();

        if (!$program) {
            return $this->sendError('Program pelatihan tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new ProgramResource($program),
            'Detail program pelatihan berhasil dimuat.'
        );
    }
}
