<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateTeacherClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'PENGAJAR';
    }

    public function rules(): array
    {
        return [
            'class_name'  => ['sometimes', 'required', 'string', 'max:255'],
            'program_id'  => ['sometimes', 'required', 'integer', 'exists:programs,id'],
            'level'       => ['nullable', 'string', 'max:100'],
            'schedule'    => ['nullable', 'string', 'max:255'],
            'start_date'  => ['nullable', 'date'],
            'end_date'    => ['nullable', 'date', 'after_or_equal:start_date'],
            'capacity'    => ['nullable', 'integer', 'min:1'],
            'location'    => ['nullable', 'string', 'max:255'],
            'status'      => ['nullable', 'in:UPCOMING,OPEN,FULL,ONGOING,COMPLETED'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_name.required'     => 'Nama rombongan belajar / kelas tidak boleh kosong.',
            'program_id.exists'       => 'Program pelatihan tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan data kelas gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
