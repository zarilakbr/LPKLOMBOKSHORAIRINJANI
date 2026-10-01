<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'cover_image',
        'thumbnail',
        'featured_image',
        'author_id',
        'author',
        'category',
        'tags',
        'read_time',
        'published_at',
        'status', // 'PUBLISHED', 'DRAFT', 'ARCHIVED'
    ];

    protected $casts = [
        'tags' => 'array',
        'published_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($art) {
            if (empty($art->slug)) {
                $art->slug = Str::slug($art->title);
            }
            if (empty($art->cover_image) && !empty($art->thumbnail)) {
                $art->cover_image = $art->thumbnail;
            }
            if (empty($art->thumbnail) && !empty($art->cover_image)) {
                $art->thumbnail = $art->cover_image;
            }
            if (empty($art->featured_image) && !empty($art->cover_image)) {
                $art->featured_image = $art->cover_image;
            }
            if (empty($art->cover_image) && !empty($art->featured_image)) {
                $art->cover_image = $art->featured_image;
            }
        });
    }

    /**
     * Author of this article (optional link to user).
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}

