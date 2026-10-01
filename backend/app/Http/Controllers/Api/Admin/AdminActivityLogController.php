<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\ActivityLogResource;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminActivityLogController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%")
                  ->orWhere('module', 'like', "%{$search}%");
            });
        }

        if ($request->has('action') && $request->action !== 'ALL') {
            $query->where('action', $request->action);
        }

        if ($request->has('module') && $request->module !== 'ALL') {
            $query->where('module', $request->module);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(20);

        return $this->sendPaginated($logs, 'Log aktivitas sistem berhasil dimuat.');
    }
}
