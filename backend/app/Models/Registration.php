<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Registration extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'registration_code',
        'user_id',
        'program_id',
        'name',
        'full_name',
        'email',
        'phone',
        'address',
        'city',
        'dob',
        'education',
        'program_interest',
        'japanese_level',
        'japan_goal',
        'message',
        'status', // 'pending', 'reviewed', 'accepted', 'rejected'
        'registration_date',
        'notes',
        'admin_notes',
    ];

    protected $casts = [
        'dob' => 'date',
        'registration_date' => 'datetime',
    ];

    /**
     * Ensure status is always normalized to uppercase.
     */
    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = $value ? strtoupper($value) : 'PENDING';
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($reg) {
            if (empty($reg->registration_code)) {
                $reg->registration_code = 'REG-' . date('Y') . '-' . strtoupper(substr(uniqid(), -5));
            }
            if (empty($reg->name) && !empty($reg->full_name)) {
                $reg->name = $reg->full_name;
            }
            if (empty($reg->full_name) && !empty($reg->name)) {
                $reg->full_name = $reg->name;
            }
            if (empty($reg->status)) {
                $reg->status = 'pending';
            }
            if (empty($reg->registration_date)) {
                $reg->registration_date = now();
            }
            if (empty($reg->notes) && !empty($reg->admin_notes)) {
                $reg->notes = $reg->admin_notes;
            }
        });
    }

    /**
     * User account who owns this registration.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The program being registered for.
     */
    public function program()
    {
        return $this->belongsTo(Program::class);
    }
}
