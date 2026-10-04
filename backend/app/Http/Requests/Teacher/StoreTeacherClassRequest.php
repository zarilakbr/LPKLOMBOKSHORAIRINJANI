<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTeacherClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'PENGAJAR';
    }

    public function rules(): array
    {
        return [
            'class_name'  => ['required', 'string', 'max:255'],
            'program_id'  => ['required', 'integer', 'exists:programs,id'],
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
            'class_name.required' => 'Nama rombongan belajar / kelas wajib diisi.',
            'program_id.required' => 'Program pelatihan wajib dipilih dari daftar yang tersedia.',
            'program_id.exists'   => 'Program pelatihan yang dipilih tidak valid.',
            'end_date.after_or_equal' => 'Tanggal selesai harus sama atau setelah tanggal mulai.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembuatan kelas bimbingan gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
