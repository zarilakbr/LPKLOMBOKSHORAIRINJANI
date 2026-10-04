<?php

namespace App\Http\Requests\Student;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateStudentPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'SISWA';
    }

    public function rules(): array
    {
        return [
            'type'       => ['sometimes', 'required', 'in:sakit,izin,keperluan_penting,keperluan_keluarga,lainnya'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date'   => ['sometimes', 'required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['sometimes', 'required', 'string', 'min:5', 'max:2000'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan perizinan gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
