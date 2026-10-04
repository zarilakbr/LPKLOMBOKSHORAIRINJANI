<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ClassResource;
use App\Models\ProgramClass;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends BaseApiController
{
    /**
     * Display a listing of upcoming and active classes.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ProgramClass::with('program')->whereIn('status', ['UPCOMING', 'OPEN', 'FULL']);

        if ($request->has('program_id')) {
            $query->where('program_id', $request->program_id);
        }

        if ($request->has('level') && $request->level !== 'ALL') {
            $query->where('level', $request->level);
        }

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(class_name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(instructor) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(location) LIKE ?', [$term]);
            });
        }

        $classes = $query->orderBy('start_date', 'asc')->get();

        return $this->sendResponse(
            ClassResource::collection($classes),
            'Jadwal kelas pelatihan berhasil dimuat.'
        );
    }
}
