<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Opportunity extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'company_name',
        'sector',
        'location',
        'employment_type',
        'type',
        'salary_range',
        'language_req',
        'age_req',
        'description',
        'requirements',
        'benefits',
        'deadline',
        'image',
        'published_at',
        'status', // 'OPEN', 'CLOSED', 'DRAFT'
    ];

    protected $casts = [
        'requirements' => 'array',
        'benefits' => 'array',
        'deadline' => 'date',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($opp) {
            if (empty($opp->slug)) {
                $opp->slug = Str::slug($opp->title);
            }
            if (empty($opp->type) && !empty($opp->employment_type)) {
                $opp->type = $opp->employment_type;
            }
            if (empty($opp->employment_type) && !empty($opp->type)) {
                $opp->employment_type = $opp->type;
            }
        });
    }
}
