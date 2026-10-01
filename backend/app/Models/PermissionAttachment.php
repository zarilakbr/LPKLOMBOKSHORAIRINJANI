<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PermissionAttachment extends Model
{
    use HasFactory;

    protected $table = 'permission_attachments';

    protected $fillable = [
        'permission_request_id',
        'file_name',
        'file_path',
        'mime_type',
        'file_size',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * The parent permission request.
     */
    public function permissionRequest()
    {
        return $this->belongsTo(PermissionRequest::class);
    }
}
