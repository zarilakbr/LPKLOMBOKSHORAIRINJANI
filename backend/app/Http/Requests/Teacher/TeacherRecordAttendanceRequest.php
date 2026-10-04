<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class TeacherRecordAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->role === 'PENGAJAR';
    }

    public function rules(): array
    {
        return [
            'class_id'        => ['required', 'integer', 'exists:classes,id'],
            'user_id'         => ['required', 'integer', 'exists:users,id'],
            'attendance_date' => ['required', 'date'],
            'status'          => ['required', 'in:hadir,terlambat,izin,sakit,alpa'],
            'notes'           => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_id.required'        => 'ID kelas wajib disertakan.',
            'class_id.exists'          => 'Kelas tidak ditemukan.',
            'user_id.required'         => 'Siswa yang dicatat absensinya wajib dipilih.',
            'user_id.exists'           => 'Data siswa tidak valid.',
            'attendance_date.required' => 'Tanggal absensi wajib diisi.',
            'status.required'          => 'Status kehadiran wajib dipilih.',
            'status.in'                => 'Status harus salah satu dari: hadir, terlambat, izin, sakit, alpa.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pencatatan absensi siswa gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
