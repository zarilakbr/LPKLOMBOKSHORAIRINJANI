<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->role === 'ADMIN' || $this->user()->role === 'PENGAJAR');
    }

    public function rules(): array
    {
        return [
            'class_id'   => ['sometimes', 'required', 'integer', 'exists:classes,id'],
            'title'      => ['sometimes', 'required', 'string', 'max:255'],
            'date'       => ['sometimes', 'required', 'date'],
            'start_time' => ['sometimes', 'required', 'string', 'regex:/^\d{1,2}:\d{2}$/'],
            'end_time'   => ['sometimes', 'required', 'string', 'regex:/^\d{1,2}:\d{2}$/'],
            'location'   => ['nullable', 'string', 'max:255'],
            'status'     => ['nullable', 'string', 'in:SCHEDULED,ONGOING,COMPLETED,CANCELLED,scheduled,ongoing,completed,cancelled'],
            'notes'      => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $start = $this->filled('start_time') ? strtotime($this->input('start_time')) : null;
            $end = $this->filled('end_time') ? strtotime($this->input('end_time')) : null;

            if ($start && $end && $end <= $start) {
                $validator->errors()->add('end_time', 'Waktu selesai harus setelah waktu mulai.');
            }
        });
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi pembaruan jadwal kelas gagal.',
            'errors'  => $validator->errors()
        ], 422));
    }
}
