<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory;

    protected $table = 'schedules';

    public const STATUS_SCHEDULED = 'SCHEDULED';
    public const STATUS_ONGOING   = 'ONGOING';
    public const STATUS_COMPLETED = 'COMPLETED';
    public const STATUS_CANCELLED = 'CANCELLED';

    protected $fillable = [
        'class_id',
        'title',
        'date',
        'start_time',
        'end_time',
        'location',
        'status',
        'notes',
    ];

    protected $casts = [
        'date'     => 'date',
        'class_id' => 'integer',
    ];

    /**
     * Ensure status is always normalized to uppercase.
     */
    public function setStatusAttribute($value): void
    {
        $this->attributes['status'] = $value ? strtoupper($value) : self::STATUS_SCHEDULED;
    }

    /**
     * The class to which this schedule session belongs.
     */
    public function class(): BelongsTo
    {
        return $this->belongsTo(ProgramClass::class, 'class_id');
    }

    /**
     * Scope to only include upcoming or today's schedules.
     */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->whereDate('date', '>=', now()->toDateString())
                     ->where('status', '!=', self::STATUS_CANCELLED);
    }

    /**
     * Scope to filter by specific date.
     */
    public function scopeForDate(Builder $query, string $date): Builder
    {
        return $query->whereDate('date', $date);
    }
}
