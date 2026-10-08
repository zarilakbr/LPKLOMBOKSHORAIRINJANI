<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\StudentResume;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentResumeController extends BaseApiController
{
    /**
     * Get the authenticated student's Japanese resume.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');
        $resume = StudentResume::where('user_id', $user->id)->first();

        // If resume doesn't exist yet, build prefilled template from user profile
        if (!$resume) {
            $profile = $user->profile;
            $defaultDataId = [
                'register_no' => 'REG-' . date('Y') . '-' . str_pad((string)$user->id, 4, '0', STR_PAD_LEFT),
                'name' => $user->name ?? '',
                'kana_name' => '',
                'romaji_name' => $user->name ?? '',
                'gender' => $profile?->gender ?? 'Laki-laki',
                'pob' => $profile?->place_of_birth ?? '',
                'dob' => $profile?->dob ? date('Y-m-d', strtotime($profile->dob)) : '',
                'height' => '',
                'weight' => '',
                'blood_type' => 'O',
                'address' => $profile?->address ?? '',
                'tattoo' => 'Tidak ada',
                'color_blindness' => 'Normal / Tidak buta warna',
                'marital_status' => 'Belum menikah',
                'smoking' => 'Tidak merokok',
                'alcohol' => 'Tidak minum alkohol',
                'passport' => 'Tidak ada / Belum ada',
                'japan_family' => 'Tidak ada',
                'study_duration_months' => '6',
                'religion' => 'Islam',
                // c) Pendidikan
                'education' => [
                    [
                        'level' => 'SMA',
                        'school_name' => $profile?->school_or_university ?? '',
                        'period_start' => '2019-07',
                        'period_end' => '2022-06',
                        'major' => $profile?->major ?? ''
                    ]
                ],
                // d) Pengalaman Kerja
                'work_experience' => [],
                // e) Susunan Keluarga
                'family' => [
                    ['relation' => 'Ayah', 'name' => '', 'age' => '', 'occupation' => 'Wiraswasta / Bisnis'],
                    ['relation' => 'Ibu', 'name' => '', 'age' => '', 'occupation' => 'Ibu Rumah Tangga']
                ],
                // f) Pertanyaan & Lain-lain
                'q_waist_problem' => 'Tidak',
                'q_illness_surgery' => 'Tidak',
                'q_family_tbc' => 'Tidak',
                'q_rules_compliance' => 'Ya',
                'q_pass_n4_confident' => 'Ya',
                'hobbies' => '',
                'skills' => '',
                'strengths' => '',
                'weaknesses' => '',
                'savings_target' => '300 Juta Rupiah',
                'reason_for_japan' => $profile?->japan_goal ?? 'Ingin bekerja dan menimba pengalaman teknologi di Jepang untuk memajukan keluarga.'
            ];

            return $this->sendResponse([
                'id' => null,
                'user_id' => $user->id,
                'register_no' => $defaultDataId['register_no'],
                'profile_photo' => $user->avatar ?? '',
                'data_id' => $defaultDataId,
                'data_jp' => null,
                'status' => 'DRAFT',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar
                ]
            ], 'Data template resume siswa berhasil disiapkan.');
        }

        return $this->sendResponse(array_merge($resume->toArray(), [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar
            ]
        ]), 'Data resume siswa berhasil dimuat.');
    }

    /**
     * Save / Update the authenticated student's Japanese resume.
     */
    public function save(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'register_no' => 'nullable|string|max:100',
            'profile_photo' => 'nullable|string',
            'data_id' => 'required|array',
            'data_jp' => 'nullable|array',
            'status' => 'nullable|string|in:DRAFT,COMPLETED,REVIEWED',
        ]);

        $resume = StudentResume::updateOrCreate(
            ['user_id' => $user->id],
            [
                'register_no' => $validated['register_no'] ?? ($validated['data_id']['register_no'] ?? null),
                'profile_photo' => $validated['profile_photo'] ?? ($user->avatar ?? null),
                'data_id' => $validated['data_id'],
                'data_jp' => $validated['data_jp'] ?? null,
                'status' => $validated['status'] ?? 'COMPLETED',
            ]
        );

        // Also sync photo to user avatar if photo is set
        if (!empty($validated['profile_photo']) && $validated['profile_photo'] !== $user->avatar) {
            $user->update(['avatar' => $validated['profile_photo']]);
        }

        return $this->sendResponse($resume, 'Resume Jepang (履歴書) berhasil disimpan.');
    }

    /**
     * Upload photo for the authenticated student's Japanese resume.
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $file = $request->file('photo');
        $user = $request->user();

        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = 'resume_' . $user->id . '_' . time() . '_' . substr(md5(uniqid()), 0, 6) . '.' . $extension;

        $uploadPath = public_path('uploads/resumes');
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        $file->move($uploadPath, $filename);
        $url = url('uploads/resumes/' . $filename);

        // Auto update resume record if exists
        $resume = StudentResume::where('user_id', $user->id)->first();
        if ($resume) {
            $resume->update(['profile_photo' => $url]);
        }
        $user->update(['avatar' => $url]);

        return $this->sendResponse([
            'url' => $url,
            'filename' => $filename,
        ], 'Foto pasfoto resume 3x4 berhasil diunggah.');
    }
}
