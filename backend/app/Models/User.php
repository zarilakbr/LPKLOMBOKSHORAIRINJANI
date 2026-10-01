<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    // Supported Exactly 3 User Roles
    public const ROLE_SISWA = 'SISWA';
    public const ROLE_PENGAJAR = 'PENGAJAR';
    public const ROLE_ADMIN = 'ADMIN';

    // Supported account statuses
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_PENDING_VERIFICATION = 'PENDING_VERIFICATION';
    public const STATUS_SUSPENDED = 'SUSPENDED';
    public const STATUS_INACTIVE = 'INACTIVE';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'avatar',
        'password',
        'role', // 'SISWA', 'PENGAJAR', 'ADMIN'
        'department',
        'status', // 'ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED', 'INACTIVE'
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /* ===================================================================
       ROLE & PERMISSION HELPERS (EXACTLY 3 ROLES)
       =================================================================== */

    public function isSiswa(): bool
    {
        return in_array($this->role, [self::ROLE_SISWA, 'USER']);
    }

    public function isPengajar(): bool
    {
        return $this->role === self::ROLE_PENGAJAR;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function hasRole(string $role): bool
    {
        return strtoupper($this->role) === strtoupper($role);
    }

    /* ===================================================================
       RELATIONSHIPS
       =================================================================== */

    /**
     * Registrations submitted by this individual user account.
     */
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    /**
     * Personal user profile details.
     */
    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    /**
     * System activity logs recorded for this user.
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Attendance records for this student.
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Permission requests submitted by this student.
     */
    public function permissionRequests()
    {
        return $this->hasMany(PermissionRequest::class);
    }

    /**
     * Personal notifications received by this user.
     */
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Classes taught by this user (when role is PENGAJAR).
     */
    public function classes()
    {
        return $this->hasMany(ProgramClass::class, 'teacher_id');
    }

    /**
     * Articles authored by this user.
     */
    public function articles()
    {
        return $this->hasMany(Article::class, 'author_id');
    }
}

