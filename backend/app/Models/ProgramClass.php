<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProgramClass extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'classes';

    protected $fillable = [
        'program_id',
        'teacher_id',
        'name',
        'class_name',
        'instructor',
        'level',
        'schedule',
        'start_date',
        'end_date',
        'capacity',
        'current_students',
        'location',
        'status', // 'UPCOMING', 'OPEN', 'FULL', 'ONGOING', 'COMPLETED'
        'description',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'capacity' => 'integer',
        'current_students' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->name) && !empty($item->class_name)) {
                $item->name = $item->class_name;
            }
            if (empty($item->class_name) && !empty($item->name)) {
                $item->class_name = $item->name;
            }
        });
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    /**
     * Teacher assigned to this class.
     */
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Attendance records for students in this class.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'class_id');
    }

    /**
     * Permission requests filed for this class.
     */
    public function permissionRequests()
    {
        return $this->hasMany(PermissionRequest::class, 'class_id');
    }
}

