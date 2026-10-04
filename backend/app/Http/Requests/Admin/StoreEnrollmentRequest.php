<?php

namespace App\Http\Requests\Admin;

use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === User::ROLE_ADMIN;
    }

    public function rules(): array
    {
        return [
            'user_id'     => ['required', 'integer', 'exists:users,id'],
            'class_id'    => ['required', 'integer', 'exists:classes,id'],
            'status'      => ['sometimes', 'in:ACTIVE,COMPLETED,CANCELLED'],
            'enrolled_at' => ['nullable', 'date'],
            'notes'       => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'user_id.required'  => 'Siswa wajib dipilih.',
            'user_id.exists'    => 'Data pengguna tidak ditemukan.',
            'class_id.required' => 'Kelas wajib dipilih.',
            'class_id.exists'   => 'Kelas tidak ditemukan.',
            'status.in'         => 'Status enrollment harus salah satu dari: ACTIVE, COMPLETED, CANCELLED.',
        ];
    }

    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $userId = $this->input('user_id');
            $classId = $this->input('class_id');
            $status = $this->input('status', Enrollment::STATUS_ACTIVE);

            // 1. Enforce student role: Only SISWA can be enrolled in classes
            if ($userId) {
                $user = User::find($userId);
                if ($user && $user->role !== User::ROLE_SISWA) {
                    $validator->errors()->add('user_id', 'Hanya pengguna dengan peran SISWA yang dapat didaftarkan ke dalam kelas.');
                }
            }

            // 2. Enforce active class check
            if ($classId) {
                $class = ProgramClass::find($classId);
                if (!$class || $class->trashed()) {
                    $validator->errors()->add('class_id', 'Kelas yang dipilih tidak aktif atau telah dihapus.');
                }
            }

            // 3. Prevent duplicate ACTIVE enrollment for same student and class
            if ($userId && $classId && $status === Enrollment::STATUS_ACTIVE) {
                $exists = Enrollment::where('user_id', $userId)
                    ->where('class_id', $classId)
                    ->where('status', Enrollment::STATUS_ACTIVE)
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('user_id', 'Siswa ini sudah memiliki pendaftaran AKTIF pada kelas yang dipilih.');
                }
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pendaftaran kelas gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
