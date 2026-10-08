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
            'image'             => ['nullable', 'string', 'url:http,https', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'image.url' => 'Tautan foto referensi harus berupa URL yang valid (diawali http:// atau https://).',
            'image.max' => 'Tautan foto referensi tidak boleh lebih dari 255 karakter.',
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
