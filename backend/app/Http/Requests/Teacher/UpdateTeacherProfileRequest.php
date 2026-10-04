<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateTeacherProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'PENGAJAR';
    }

    public function rules(): array
    {
        return [
            'name'             => ['sometimes', 'required', 'string', 'max:255'],
            'phone'            => ['nullable', 'string', 'max:25'],
            'avatar'           => ['nullable', 'string', 'max:500'],
            'department'       => ['nullable', 'string', 'max:255'],
            'current_password' => ['required_with:password', 'nullable', 'current_password'],
            'password'         => ['nullable', 'string', 'min:6'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan profil pengajar gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
