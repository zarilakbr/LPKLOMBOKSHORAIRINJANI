<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentResume extends Model
{
    use HasFactory;

    protected $table = 'student_resumes';

    protected $fillable = [
        'user_id',
        'register_no',
        'profile_photo',
        'data_id',
        'data_jp',
        'status',
    ];

    protected $casts = [
        'data_id' => 'array',
        'data_jp' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
