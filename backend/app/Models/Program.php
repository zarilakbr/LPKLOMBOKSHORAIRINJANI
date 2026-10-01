<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Program extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'level',
        'short_description',
        'description',
        'full_description',
        'duration',
        'schedule',
        'curriculum',
        'target_audience',
        'image',
        'price_estimate',
        'badge',
        'status',
        'featured',
        'sort_order',
        'order',
    ];

    protected $casts = [
        'curriculum' => 'array',
        'featured' => 'boolean',
        'sort_order' => 'integer',
        'order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($program) {
            if (empty($program->slug)) {
                $program->slug = Str::slug($program->title);
            }
            if (empty($program->description) && !empty($program->full_description)) {
                $program->description = $program->full_description;
            }
            if (empty($program->full_description) && !empty($program->description)) {
                $program->full_description = $program->description;
            }
        });
    }

    public function classes()
    {
        return $this->hasMany(ProgramClass::class);
    }

    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }
}
