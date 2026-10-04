<?php

namespace App\Http\Requests\Admin;

use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === User::ROLE_ADMIN;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['sometimes', 'integer', 'exists:classes,id'],
            'status'   => ['sometimes', 'required', 'in:ACTIVE,COMPLETED,CANCELLED'],
            'ended_at' => ['nullable', 'date'],
            'notes'    => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_id.exists' => 'Kelas tujuan tidak ditemukan.',
            'status.in'       => 'Status enrollment harus salah satu dari: ACTIVE, COMPLETED, CANCELLED.',
        ];
    }

    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $enrollmentId = $this->route('enrollment') ?? $this->route('id');

            if ($enrollmentId) {
                $enrollment = Enrollment::find($enrollmentId);
                if ($enrollment) {
                    $effectiveClassId = $this->input('class_id', $enrollment->class_id);
                    $effectiveStatus = $this->input('status', $enrollment->status);

                    if ($effectiveStatus === Enrollment::STATUS_ACTIVE) {
                        $otherActive = Enrollment::where('user_id', $enrollment->user_id)
                            ->where('class_id', $effectiveClassId)
                            ->where('id', '!=', $enrollment->id)
                            ->where('status', Enrollment::STATUS_ACTIVE)
                            ->exists();

                        if ($otherActive) {
                            $validator->errors()->add('class_id', 'Siswa sudah memiliki pendaftaran AKTIF pada kelas ini.');
                        }
                    }
                }
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan enrollment gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
