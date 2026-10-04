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

        if ($request->filled('search')) {
            $term = '%' . strtolower(trim($request->search)) . '%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(description) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(user_name) LIKE ?', [$term])
                  ->orWhereRaw('LOWER(module) LIKE ?', [$term]);
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
