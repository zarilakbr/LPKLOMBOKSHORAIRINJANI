<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_COMPLETED = 'COMPLETED';
    public const STATUS_CANCELLED = 'CANCELLED';

    protected $table = 'enrollments';

    protected $fillable = [
        'user_id',
        'class_id',
        'status',
        'enrolled_at',
        'ended_at',
        'notes',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'ended_at'    => 'datetime',
    ];

    /**
     * Ensure status is always normalized to uppercase.
     */
    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = $value ? strtoupper($value) : self::STATUS_ACTIVE;
    }

    /**
     * Student who owns this enrollment.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Student alias for readability.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Class session associated with this enrollment.
     */
    public function class()
    {
        return $this->belongsTo(ProgramClass::class, 'class_id');
    }

    /**
     * ProgramClass alias.
     */
    public function programClass()
    {
        return $this->belongsTo(ProgramClass::class, 'class_id');
    }

    /**
     * Scope for only currently active enrollments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for completed enrollments.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    /**
     * Scope for cancelled enrollments.
     */
    public function scopeCancelled($query)
    {
        return $query->where('status', self::STATUS_CANCELLED);
    }
}
