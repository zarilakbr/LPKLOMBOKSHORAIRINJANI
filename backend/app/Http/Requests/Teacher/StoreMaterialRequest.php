<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMaterialRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->role === 'PENGAJAR' || $this->user()->role === 'ADMIN');
    }

    public function rules(): array
    {
        return [
            'class_id'     => ['required', 'integer', 'exists:classes,id'],
            'title'        => ['required', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:10000'],
            'type'         => ['required', 'string', 'in:file,link,text'],
            'external_url' => ['required_if:type,link', 'nullable', 'url', 'max:1000'],
            'file'         => [
                'required_if:type,file',
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
            'class_id.required'         => 'Kelas untuk materi pembelajaran wajib dipilih.',
            'class_id.exists'           => 'Kelas yang dipilih tidak valid atau tidak ditemukan.',
            'title.required'            => 'Judul materi wajib diisi.',
            'title.max'                 => 'Judul materi maksimal 255 karakter.',
            'type.required'             => 'Jenis materi wajib dipilih (file, link, atau text).',
            'type.in'                   => 'Jenis materi hanya boleh file, link, atau text.',
            'external_url.required_if'  => 'URL tautan eksternal wajib diisi untuk jenis materi link.',
            'external_url.url'          => 'Format tautan eksternal harus berupa URL yang valid (misal: https://...).',
            'file.required_if'          => 'Berkas materi wajib diunggah untuk jenis materi file.',
            'file.file'                 => 'Berkas harus berupa file yang valid.',
            'file.mimes'                => 'Format file hanya diperbolehkan PDF, Word, Excel, PPT, ZIP, JPG, JPEG, PNG, atau WEBP.',
            'file.max'                  => 'Ukuran berkas maksimal 20 MB.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Text type requires description content
            if ($this->input('type') === 'text' && empty(trim((string) $this->input('description')))) {
                $validator->errors()->add('description', 'Konten teks materi wajib diisi untuk jenis materi teks.');
            }

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
            'message' => 'Validasi data materi pembelajaran gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
