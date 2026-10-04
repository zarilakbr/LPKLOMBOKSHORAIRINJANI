<?php

namespace App\Http\Requests\Student;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreStudentPermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'SISWA';
    }

    public function rules(): array
    {
        return [
            'class_id'   => ['required', 'integer', 'exists:classes,id'],
            'type'       => ['required', 'in:sakit,izin,keperluan_penting,keperluan_keluarga,lainnya'],
            'start_date' => ['required', 'date'],
            'end_date'   => ['required', 'date', 'after_or_equal:start_date'],
            'reason'     => ['required', 'string', 'min:5', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_id.required'          => 'Kelas tujuan permohonan izin wajib dipilih.',
            'class_id.exists'            => 'Kelas yang dipilih tidak valid.',
            'type.required'              => 'Jenis permohonan izin wajib dipilih.',
            'type.in'                    => 'Jenis izin harus salah satu dari: sakit, izin, keperluan_penting, keperluan_keluarga, lainnya.',
            'start_date.required'        => 'Tanggal mulai izin wajib diisi.',
            'end_date.required'          => 'Tanggal akhir izin wajib diisi.',
            'end_date.after_or_equal'    => 'Tanggal akhir izin tidak boleh lebih awal dari tanggal mulai.',
            'reason.required'            => 'Alasan izin wajib dijelaskan secara rinci.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pengajuan perizinan gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
