<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'phone',
        'gender',
        'dob',
        'place_of_birth',
        'address',
        'city',
        'province',
        'postal_code',
        'education_level',
        'school_or_university',
        'major',
        'japanese_level',
        'japan_goal',
        'bio',
        'id_card_number',
        'emergency_contact_name',
        'emergency_contact_phone',
    ];

    protected $casts = [
        'dob' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
