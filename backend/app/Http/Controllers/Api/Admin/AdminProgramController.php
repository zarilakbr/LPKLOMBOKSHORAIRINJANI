<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Resources\ProgramResource;
use App\Models\Program;
use App\Services\ProgramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProgramController extends BaseApiController
{
    public function __construct(
        protected ProgramService $programService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Program::withCount('classes', 'registrations');

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(category) LIKE ?', [$term]);
            });
        }

        if ($request->has('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        $programs = $query->orderBy('order', 'asc')->paginate(15);

        return $this->sendPaginated($programs, 'Daftar program admin berhasil dimuat.');
    }

    public function store(StoreProgramRequest $request): JsonResponse
    {
        $program = $this->programService->createProgram($request->validated(), $request->user());

        return $this->sendResponse(
            new ProgramResource($program),
            'Program berhasil ditambahkan.',
            201
        );
    }

    public function show(int $id): JsonResponse
    {
        $program = Program::with('classes')->find($id);

        if (!$program) {
            return $this->sendError('Program tidak ditemukan.', [], 404);
        }

        return $this->sendResponse(
            new ProgramResource($program),
            'Data detail program berhasil dimuat.'
        );
    }

    public function update(StoreProgramRequest $request, int $id): JsonResponse
    {
        $program = Program::find($id);

        if (!$program) {
            return $this->sendError('Program tidak ditemukan.', [], 404);
        }

        $updated = $this->programService->updateProgram($program, $request->validated(), $request->user());

        return $this->sendResponse(
            new ProgramResource($updated),
            'Data program berhasil diperbarui.'
        );
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $program = Program::find($id);

        if (!$program) {
            return $this->sendError('Program tidak ditemukan.', [], 404);
        }

        $this->programService->deleteProgram($program, $request->user());

        return $this->sendResponse(null, 'Program berhasil dihapus.');
    }
}
