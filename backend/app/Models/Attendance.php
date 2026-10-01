<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    public const STATUS_HADIR = 'hadir';
    public const STATUS_TERLAMBAT = 'terlambat';
    public const STATUS_IZIN = 'izin';
    public const STATUS_SAKIT = 'sakit';
    public const STATUS_ALPA = 'alpa';

    protected $table = 'attendances';

    protected $fillable = [
        'user_id',
        'class_id',
        'attendance_date',
        'check_in_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'check_in_at' => 'datetime',
    ];

    /**
     * The student who this attendance belongs to.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The class session associated with this attendance record.
     */
    public function class()
    {
        return $this->belongsTo(ProgramClass::class, 'class_id');
    }
}
