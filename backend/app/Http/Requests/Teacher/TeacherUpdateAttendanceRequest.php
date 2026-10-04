<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class TeacherUpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'PENGAJAR';
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'required', 'in:hadir,terlambat,izin,sakit,alpa'],
            'notes'  => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan absensi gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
