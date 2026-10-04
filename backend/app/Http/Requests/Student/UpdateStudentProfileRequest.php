<?php

namespace App\Http\Requests\Student;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'SISWA';
    }

    public function rules(): array
    {
        return [
            'name'                    => ['sometimes', 'required', 'string', 'max:255'],
            'phone'                   => ['nullable', 'string', 'max:25'],
            'avatar'                  => ['nullable', 'string', 'max:500'],
            'full_name'               => ['nullable', 'string', 'max:255'],
            'gender'                  => ['nullable', 'in:male,female'],
            'dob'                     => ['nullable', 'date'],
            'place_of_birth'          => ['nullable', 'string', 'max:100'],
            'address'                 => ['nullable', 'string', 'max:1000'],
            'city'                    => ['nullable', 'string', 'max:100'],
            'province'                => ['nullable', 'string', 'max:100'],
            'postal_code'             => ['nullable', 'string', 'max:20'],
            'education_level'         => ['nullable', 'string', 'max:100'],
            'school_or_university'    => ['nullable', 'string', 'max:255'],
            'major'                   => ['nullable', 'string', 'max:100'],
            'japanese_level'          => ['nullable', 'string', 'max:100'],
            'japan_goal'              => ['nullable', 'string', 'max:1000'],
            'bio'                     => ['nullable', 'string', 'max:2000'],
            'id_card_number'          => ['nullable', 'string', 'max:50'],
            'emergency_contact_name'  => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:25'],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan profil gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
