<?php

use App\Models\Enrollment;
use App\Models\ProgramClass;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
| Strict channel authorization protecting against IDOR and role leakage.
*/

// 1. Private User Channel (Personal notifications and student-specific updates)
Broadcast::channel('user.{id}', function (User $user, $id) {
    return (int) $user->id === (int) $id;
});

// 2. Private Class Channel (Class members: enrolled students + assigned teacher + admin)
Broadcast::channel('class.{id}', function (User $user, $id) {
    $classId = (int) $id;

    // Admin can monitor any class channel
    if ($user->role === User::ROLE_ADMIN) {
        return true;
    }

    // Teacher can ONLY subscribe to classes they are assigned to
    if ($user->role === User::ROLE_PENGAJAR) {
        return ProgramClass::where('id', $classId)
            ->where('teacher_id', $user->id)
            ->exists();
    }

    // Student can ONLY subscribe if they have an ACTIVE enrollment in this class
    if ($user->role === User::ROLE_SISWA) {
        return Enrollment::where('user_id', $user->id)
            ->where('class_id', $classId)
            ->where('status', Enrollment::STATUS_ACTIVE)
            ->exists();
    }

    return false;
});

// 3. Private Admin Channel (Restricted strictly to users with role ADMIN)
Broadcast::channel('admin', function (User $user) {
    return $user->role === User::ROLE_ADMIN;
});
