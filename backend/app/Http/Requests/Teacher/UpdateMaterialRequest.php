<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->role === 'PENGAJAR' || $this->user()->role === 'ADMIN');
    }

    public function rules(): array
    {
        return [
            'class_id'     => ['sometimes', 'required', 'integer', 'exists:classes,id'],
            'title'        => ['sometimes', 'required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:10000'],
            'type'         => ['sometimes', 'required', 'string', 'in:file,link,text'],
            'external_url' => ['nullable', 'url', 'max:1000'],
            'file'         => [
                'nullable',
                'file',
                'max:20480', // 20 MB max
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,png,jpg,jpeg,webp',
            ],
            'is_published' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_id.exists'          => 'Kelas yang dipilih tidak valid atau tidak ditemukan.',
            'title.required'           => 'Judul materi wajib diisi.',
            'title.max'                => 'Judul materi maksimal 255 karakter.',
            'type.in'                  => 'Jenis materi hanya boleh file, link, atau text.',
            'external_url.url'         => 'Format tautan eksternal harus berupa URL yang valid (misal: https://...).',
            'file.file'                => 'Berkas harus berupa file yang valid.',
            'file.mimes'               => 'Format file hanya diperbolehkan PDF, Word, Excel, PPT, ZIP, JPG, JPEG, PNG, atau WEBP.',
            'file.max'                 => 'Ukuran berkas maksimal 20 MB.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Strict file extension security check against executable / script formats
            if ($this->hasFile('file')) {
                $file = $this->file('file');
                $ext = strtolower($file->getClientOriginalExtension());
                $dangerous = [
                    'php', 'phtml', 'phar', 'php3', 'php4', 'php5', 'php7', 'php8',
                    'exe', 'sh', 'bat', 'cmd', 'js', 'vbs', 'com', 'scr', 'py', 'pl', 'cgi',
                    'bin', 'apk', 'jar', 'msi', 'wsf'
                ];
                if (in_array($ext, $dangerous, true)) {
                    $validator->errors()->add('file', 'File dengan format eksekusi/skrip (' . $ext . ') ditolak demi keamanan.');
                }
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan data materi pembelajaran gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
