<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'role',
        'content',
        'quote',
        'photo',
        'avatar',
        'program',
        'placement',
        'year',
        'badge',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($item) {
            if (empty($item->content) && !empty($item->quote)) {
                $item->content = $item->quote;
            }
            if (empty($item->quote) && !empty($item->content)) {
                $item->quote = $item->content;
            }
            if (empty($item->photo) && !empty($item->avatar)) {
                $item->photo = $item->avatar;
            }
            if (empty($item->avatar) && !empty($item->photo)) {
                $item->avatar = $item->photo;
            }
        });
    }
}
