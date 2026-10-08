<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'     => ['required', 'string', 'max:255'],
            'excerpt'   => ['required', 'string', 'max:500'],
            'content'   => ['required', 'string'],
            'author'    => ['required', 'string', 'max:255'],
            'category'  => ['required', 'string', 'max:100'],
            'tags'      => ['nullable', 'array'],
            'read_time' => ['nullable', 'string', 'max:50'],
            'thumbnail' => ['nullable', 'string', 'url:http,https', 'max:255'],
            'status'    => ['required', 'in:PUBLISHED,DRAFT,ARCHIVED'],
        ];
    }

    public function messages(): array
    {
        return [
            'thumbnail.url' => 'Link foto harus berupa URL valid yang diawali http:// atau https://.',
            'thumbnail.max' => 'Link foto maksimal 255 karakter.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data artikel gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
