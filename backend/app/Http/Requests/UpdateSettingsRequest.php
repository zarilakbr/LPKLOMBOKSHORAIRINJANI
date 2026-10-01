<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'institutionName'     => ['required', 'string', 'max:255'],
            'japaneseName'        => ['nullable', 'string', 'max:255'],
            'legalAccreditation'  => ['nullable', 'string', 'max:255'],
            'address'             => ['required', 'string'],
            'phone'               => ['required', 'string', 'max:50'],
            'whatsapp'            => ['required', 'string', 'max:50'],
            'email'               => ['required', 'email', 'max:255'],
            'operatingHours'      => ['nullable', 'string', 'max:255'],
            'socialMedia'         => ['nullable', 'array'],
            'hero'                => ['nullable', 'array'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pengaturan lembaga gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
