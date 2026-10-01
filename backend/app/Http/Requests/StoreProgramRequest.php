<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'             => ['required', 'string', 'max:255'],
            'category'          => ['required', 'string', 'max:100'],
            'level'             => ['required', 'string', 'max:100'],
            'short_description' => ['required', 'string', 'max:500'],
            'full_description'  => ['required', 'string'],
            'duration'          => ['required', 'string', 'max:100'],
            'schedule'          => ['required', 'string', 'max:255'],
            'price_estimate'    => ['nullable', 'string', 'max:100'],
            'curriculum'        => ['nullable', 'array'],
            'status'            => ['nullable', 'in:ACTIVE,INACTIVE'],
            'order'             => ['nullable', 'integer'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data program gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
