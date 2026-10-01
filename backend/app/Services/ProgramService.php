<?php

namespace App\Services;

use App\Models\Program;
use App\Models\User;
use Illuminate\Support\Str;

class ProgramService
{
    public function __construct(
        protected ActivityLogService $activityLogService
    ) {}

    public function createProgram(array $data, ?User $actor = null): Program
    {
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $program = Program::create($data);

        if ($actor) {
            $this->activityLogService->log(
                $actor->id,
                $actor->name,
                'CREATE',
                'Programs',
                "Menambahkan program baru: {$program->title}."
            );
        }

        return $program;
    }

    public function updateProgram(Program $program, array $data, ?User $actor = null): Program
    {
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        $program->update($data);

        if ($actor) {
            $this->activityLogService->log(
                $actor->id,
                $actor->name,
                'UPDATE',
                'Programs',
                "Memperbarui data program: {$program->title}."
            );
        }

        return $program;
    }

    public function deleteProgram(Program $program, ?User $actor = null): bool
    {
        $title = $program->title;
        $deleted = $program->delete();

        if ($deleted && $actor) {
            $this->activityLogService->log(
                $actor->id,
                $actor->name,
                'DELETE',
                'Programs',
                "Menghapus program: {$title}."
            );
        }

        return (bool) $deleted;
    }
}
