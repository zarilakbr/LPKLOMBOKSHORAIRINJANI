<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Publicly accessible registration
    }

    public function rules(): array
    {
        return [
            'full_name'        => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255'],
            'phone'            => ['required', 'string', 'min:9', 'max:25'],
            'dob'              => ['required', 'date'],
            'education'        => ['required', 'string', 'max:100'],
            'city'             => ['required', 'string', 'max:100'],
            'program_interest' => ['required', 'string', 'max:255'],
            'japanese_level'   => ['required', 'string', 'max:100'],
            'japan_goal'       => ['required', 'string', 'max:255'],
            'message'          => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required'        => 'Nama lengkap wajib diisi.',
            'email.required'            => 'Alamat email wajib diisi.',
            'email.email'               => 'Format alamat email tidak valid.',
            'phone.required'            => 'Nomor WhatsApp / telepon wajib diisi.',
            'phone.min'                 => 'Nomor WhatsApp minimal 9 digit.',
            'dob.required'              => 'Tanggal lahir wajib diisi.',
            'city.required'             => 'Kota domisili wajib diisi.',
            'program_interest.required' => 'Peminatan program pelatihan wajib dipilih.',
            'japanese_level.required'   => 'Tingkat kemampuan bahasa Jepang wajib dipilih.',
            'japan_goal.required'       => 'Tujuan / sektor karier wajib dipilih.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi formulir pendaftaran gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
