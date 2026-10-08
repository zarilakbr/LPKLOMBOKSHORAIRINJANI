<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\StudentResume;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminResumeController extends BaseApiController
{
    /**
     * Get list of all student resumes.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::where('role', User::ROLE_SISWA)->with('resume');

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(email) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(phone) LIKE ?', [$term]);
            });
        }

        if ($request->filled('status') && $request->status !== 'ALL') {
            if ($request->status === 'EMPTY') {
                $query->whereDoesntHave('resume');
            } else {
                $query->whereHas('resume', function ($q) use ($request) {
                    $q->where('status', $request->status);
                });
            }
        }

        $students = $query->orderBy('name', 'asc')->get();

        $data = $students->map(function ($stu) {
            $resume = $stu->resume;
            return [
                'id' => $resume?->id,
                'user_id' => $stu->id,
                'student_name' => $stu->name,
                'student_email' => $stu->email,
                'student_phone' => $stu->phone,
                'student_avatar' => $stu->avatar,
                'register_no' => $resume?->register_no ?? ('REG-' . date('Y') . '-' . str_pad((string)$stu->id, 4, '0', STR_PAD_LEFT)),
                'profile_photo' => $resume?->profile_photo ?? $stu->avatar,
                'status' => $resume ? $resume->status : 'BELUM_ISI',
                'has_japanese_data' => !empty($resume?->data_jp),
                'updated_at' => $resume?->updated_at?->toISOString() ?? null,
            ];
        });

        return $this->sendResponse($data, 'Daftar resume siswa berhasil dimuat.');
    }

    /**
     * Get single resume detail by resume ID or student user ID.
     */
    public function show(int $id): JsonResponse
    {
        // Try find by resume ID first, then by user_id
        $resume = StudentResume::with('user')->find($id);
        if (!$resume) {
            $resume = StudentResume::with('user')->where('user_id', $id)->first();
        }

        if (!$resume) {
            // If student exists but hasn't created resume, provide default view
            $user = User::where('id', $id)->where('role', User::ROLE_SISWA)->first();
            if ($user) {
                return $this->sendResponse([
                    'id' => null,
                    'user_id' => $user->id,
                    'register_no' => 'REG-' . date('Y') . '-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT),
                    'profile_photo' => $user->avatar,
                    'data_id' => null,
                    'data_jp' => null,
                    'status' => 'BELUM_ISI',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'avatar' => $user->avatar
                    ]
                ], 'Siswa belum melengkapi resume.');
            }

            return $this->sendError('Resume siswa tidak ditemukan.', [], 404);
        }

        return $this->sendResponse($resume, 'Detail resume siswa berhasil dimuat.');
    }

    /**
     * Update resume data or Japanese translation (Admin review/edit).
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $resume = StudentResume::find($id);
        if (!$resume) {
            $resume = StudentResume::where('user_id', $id)->first();
        }

        if (!$resume) {
            return $this->sendError('Resume siswa tidak ditemukan.', [], 404);
        }

        $validated = $request->validate([
            'register_no' => 'nullable|string|max:100',
            'profile_photo' => 'nullable|string',
            'data_id' => 'nullable|array',
            'data_jp' => 'nullable|array',
            'status' => 'nullable|string|in:DRAFT,COMPLETED,REVIEWED',
        ]);

        if (isset($validated['register_no'])) $resume->register_no = $validated['register_no'];
        if (isset($validated['profile_photo'])) $resume->profile_photo = $validated['profile_photo'];
        if (isset($validated['data_id'])) $resume->data_id = $validated['data_id'];
        if (isset($validated['data_jp'])) $resume->data_jp = $validated['data_jp'];
        if (isset($validated['status'])) $resume->status = $validated['status'];

        $resume->save();

        return $this->sendResponse($resume->fresh('user'), 'Perubahan resume & hasil terjemahan Jepang berhasil disimpan.');
    }

    /**
     * Upload photo for a student's Japanese resume (Admin).
     */
    public function uploadPhoto(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $file = $request->file('photo');
        $resume = StudentResume::find($id);
        if (!$resume) {
            $resume = StudentResume::where('user_id', $id)->first();
        }
        $userId = $resume ? $resume->user_id : $id;

        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = 'resume_' . $userId . '_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $extension;

        $uploadPath = public_path('uploads/resumes');
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $filename);
        $url = url('uploads/resumes/' . $filename);

        if ($resume) {
            $resume->update(['profile_photo' => $url]);
        }
        User::where('id', $userId)->update(['avatar' => $url]);

        return $this->sendResponse([
            'url' => $url,
            'filename' => $filename,
        ], 'Foto resume siswa berhasil diunggah.');
    }
}
