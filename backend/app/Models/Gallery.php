<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Gallery extends Model
{
    use HasFactory;

    protected $table = 'gallery';

    protected $fillable = [
        'title',
        'image',
        'description',
        'category',
        'sort_order',
        'order',
        'status',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'order' => 'integer',
    ];
}
