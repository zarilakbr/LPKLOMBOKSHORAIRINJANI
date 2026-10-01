<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Request;

class ActivityLogService
{
    /**
     * Record an administrative activity log entry.
     */
    public function log(
        ?int $userId,
        ?string $userName,
        string $action,
        string $module,
        string $description,
        ?string $ipAddress = null
    ): ActivityLog {
        return ActivityLog::create([
            'user_id'     => $userId,
            'user_name'   => $userName,
            'action'      => $action,
            'module'      => $module,
            'description' => $description,
            'ip_address'  => $ipAddress ?? Request::ip(),
        ]);
    }
}
