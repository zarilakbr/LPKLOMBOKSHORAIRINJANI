<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = [
        'question',
        'answer',
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
