<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Facility extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'description',
        'image',
        'status',
        'sort_order',
        'order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'order' => 'integer',
    ];
}
