<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->role === 'ADMIN' || $this->user()->role === 'PENGAJAR');
    }

    public function rules(): array
    {
        return [
            'class_id'   => ['required', 'integer', 'exists:classes,id'],
            'title'      => ['required', 'string', 'max:255'],
            'date'       => ['required', 'date'],
            'start_time' => ['required', 'string', 'regex:/^\d{1,2}:\d{2}$/'],
            'end_time'   => ['required', 'string', 'regex:/^\d{1,2}:\d{2}$/'],
            'location'   => ['nullable', 'string', 'max:255'],
            'status'     => ['nullable', 'string', 'in:SCHEDULED,ONGOING,COMPLETED,CANCELLED,scheduled,ongoing,completed,cancelled'],
            'notes'      => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'class_id.required'   => 'Kelas wajib dipilih.',
            'class_id.exists'     => 'Kelas yang dipilih tidak ditemukan.',
            'title.required'      => 'Judul/aktivitas sesi jadwal wajib diisi.',
            'title.max'           => 'Judul sesi maksimal 255 karakter.',
            'date.required'       => 'Tanggal sesi jadwal wajib diisi.',
            'date.date'           => 'Format tanggal tidak valid.',
            'start_time.required' => 'Waktu mulai wajib diisi (format HH:MM).',
            'end_time.required'   => 'Waktu selesai wajib diisi (format HH:MM).',
            'status.in'           => 'Status harus SCHEDULED, ONGOING, COMPLETED, atau CANCELLED.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $start = strtotime($this->input('start_time'));
            $end = strtotime($this->input('end_time'));

            if ($start && $end && $end <= $start) {
                $validator->errors()->add('end_time', 'Waktu selesai harus setelah waktu mulai.');
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi data jadwal kelas gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
