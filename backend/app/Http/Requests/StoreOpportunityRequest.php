<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreOpportunityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'sector'       => ['required', 'string', 'max:100'],
            'location'     => ['required', 'string', 'max:255'],
            'salary_range' => ['nullable', 'string', 'max:100'],
            'language_req' => ['required', 'string', 'max:100'],
            'age_req'      => ['nullable', 'string', 'max:100'],
            'description'  => ['required', 'string'],
            'requirements' => ['nullable', 'array'],
            'benefits'     => ['nullable', 'array'],
            'status'       => ['required', 'in:OPEN,CLOSED,DRAFT'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data peluang kerja gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
