<?php

namespace App\Http\Controllers\Api;

use App\Models\PermissionAttachment;
use App\Models\PermissionRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PermissionAttachmentDownloadController extends BaseApiController
{
    /**
     * Securely download permission attachment with RBAC and IDOR protection.
     * - ADMIN: Allowed for all permissions.
     * - PENGAJAR: Allowed only if teacher is assigned to the class.
     * - SISWA: Allowed only if permission belongs to the authenticated student.
     */
    public function download(Request $request, int $permissionId, int $attachmentId): StreamedResponse|JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return $this->sendError('Unauthenticated.', [], 401);
        }

        $permission = PermissionRequest::with('class')->find($permissionId);
        if (!$permission) {
            return $this->sendError('Permohonan izin tidak ditemukan.', [], 404);
        }

        if ($user->role === User::ROLE_ADMIN) {
            // Admin authorized
        } elseif ($user->role === User::ROLE_PENGAJAR) {
            if (!$permission->class || $permission->class->teacher_id !== $user->id) {
                return $this->sendError('Akses ditolak. Anda tidak berhak mengakses dokumen permohonan kelas ini.', [], 403);
            }
        } elseif ($user->role === User::ROLE_SISWA) {
            if ($permission->user_id !== $user->id) {
                return $this->sendError('Akses ditolak. Anda tidak memiliki izin untuk mengunduh lampiran ini.', [], 403);
            }
        } else {
            return $this->sendError('Akses ditolak.', [], 403);
        }

        $attachment = PermissionAttachment::where('id', $attachmentId)
            ->where('permission_request_id', $permission->id)
            ->first();

        if (!$attachment) {
            return $this->sendError('Berkas lampiran tidak ditemukan.', [], 404);
        }

        $disk = Storage::disk('local')->exists($attachment->file_path)
            ? 'local'
            : (Storage::disk('public')->exists($attachment->file_path) ? 'public' : null);

        if (!$disk) {
            return $this->sendError('Berkas fisik lampiran tidak ditemukan di penyimpanan server.', [], 404);
        }

        return Storage::disk($disk)->download(
            $attachment->file_path,
            $attachment->file_name ?: basename($attachment->file_path)
        );
    }
}
