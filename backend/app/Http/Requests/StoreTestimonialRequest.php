<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreTestimonialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'avatar'    => ['nullable', 'string', 'max:500'],
            'program'   => ['required', 'string', 'max:255'],
            'placement' => ['required', 'string', 'max:255'],
            'quote'     => ['required', 'string'],
            'year'      => ['required', 'string', 'max:10'],
            'badge'     => ['nullable', 'string', 'max:100'],
            'status'    => ['required', 'in:ACTIVE,INACTIVE'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data testimoni gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
