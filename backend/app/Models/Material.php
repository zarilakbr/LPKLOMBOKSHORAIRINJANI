<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Material extends Model
{
    use HasFactory;

    protected $table = 'materials';

    public const TYPE_FILE = 'file';
    public const TYPE_LINK = 'link';
    public const TYPE_TEXT = 'text';

    protected $fillable = [
        'class_id',
        'teacher_id',
        'title',
        'description',
        'type',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size',
        'external_url',
        'is_published',
        'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'file_size'    => 'integer',
        'class_id'     => 'integer',
        'teacher_id'   => 'integer',
    ];

    /**
     * The class to which this learning material belongs.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(ProgramClass::class, 'class_id');
    }

    /**
     * The teacher/user who authored/uploaded this material.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Scope to only include published materials.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true);
    }
}
