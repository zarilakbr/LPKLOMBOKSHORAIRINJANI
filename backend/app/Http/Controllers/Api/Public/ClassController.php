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

        $classes = $query->orderBy('start_date', 'asc')->get();

        return $this->sendResponse(
            ClassResource::collection($classes),
            'Jadwal kelas pelatihan berhasil dimuat.'
        );
    }
}
