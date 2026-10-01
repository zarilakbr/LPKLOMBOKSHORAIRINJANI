<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermissionRequest extends Model
{
    use HasFactory;

    public const TYPE_SAKIT = 'sakit';
    public const TYPE_IZIN = 'izin';
    public const TYPE_KEPERLUAN_PENTING = 'keperluan_penting';
    public const TYPE_KEPERLUAN_KELUARGA = 'keperluan_keluarga';
    public const TYPE_LAINNYA = 'lainnya';

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $table = 'permission_requests';

    protected $fillable = [
        'user_id',
        'class_id',
        'type',
        'start_date',
        'end_date',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    /**
     * The student requesting permission.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The class for which permission is requested.
     */
    public function class()
    {
        return $this->belongsTo(ProgramClass::class, 'class_id');
    }

    /**
     * The teacher/admin who reviewed this request.
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Supporting document attachments (doctor's note, letter, etc.).
     */
    public function attachments()
    {
        return $this->hasMany(PermissionAttachment::class);
    }
}
