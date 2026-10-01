<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreFacilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'category'    => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:1000'],
            'image'       => ['required', 'string', 'max:500'],
            'order'       => ['nullable', 'integer'],
            'status'      => ['required', 'in:ACTIVE,INACTIVE'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi fasilitas gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
