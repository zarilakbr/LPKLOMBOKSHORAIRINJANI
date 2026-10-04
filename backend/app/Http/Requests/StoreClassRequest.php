<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'class_name'       => ['required', 'string', 'max:255'],
            'program_id'       => ['nullable', 'exists:programs,id'],
            'teacher_id'       => ['nullable', 'exists:users,id'],
            'instructor'       => ['nullable', 'string', 'max:255'],
            'level'            => ['nullable', 'string', 'max:100'],
            'schedule'         => ['required', 'string', 'max:255'],
            'start_date'       => ['required', 'date'],
            'end_date'         => ['required', 'date', 'after_or_equal:start_date'],
            'capacity'         => ['required', 'integer', 'min:1'],
            'current_students' => ['nullable', 'integer', 'min:0'],
            'location'         => ['required', 'string', 'max:255'],
            'status'           => ['required', 'in:UPCOMING,OPEN,FULL,ONGOING,COMPLETED'],
            'description'      => ['nullable', 'string'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data kelas gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
