<?php

namespace App\Http\Requests\Student;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePermissionAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'SISWA';
    }

    protected function prepareForValidation(): void
    {
        if (!$this->hasFile('file') && $this->hasFile('attachment')) {
            $this->files->set('file', $this->file('attachment'));
        }
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png,webp',
                'max:5120', // Max 5 MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'File bukti dokumen wajib diunggah.',
            'file.file'     => 'Berkas yang diunggah harus berupa file yang valid.',
            'file.mimes'    => 'Format file hanya diperbolehkan PDF, JPG, JPEG, PNG, atau WEBP.',
            'file.max'      => 'Ukuran file dokumen maksimal 5 MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi unggahan dokumen lampiran gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
