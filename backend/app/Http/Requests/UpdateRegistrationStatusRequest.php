<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateRegistrationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status'      => ['required', 'in:NEW,CONTACTED,CONSULTATION,REGISTERED,TRAINING,COMPLETED,REJECTED'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Status pendaftaran tidak valid.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
