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

    // Aliases
    public const STATUS_PRESENT = self::STATUS_HADIR;
    public const STATUS_LATE = self::STATUS_TERLAMBAT;
    public const STATUS_EXCUSED = self::STATUS_IZIN;
    public const STATUS_SICK = self::STATUS_SAKIT;
    public const STATUS_ABSENT = self::STATUS_ALPA;

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
     * Ensure status is always normalized to lowercase.
     */
    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = $value ? strtolower($value) : self::STATUS_HADIR;
    }

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
