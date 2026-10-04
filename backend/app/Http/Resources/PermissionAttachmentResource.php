<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $downloadUrl = null;
        if ($user) {
            $prefix = match ($user->role) {
                'SISWA'    => 'student',
                'PENGAJAR' => 'teacher',
                'ADMIN'    => 'admin',
                default    => 'student',
            };
            $downloadUrl = url("/api/{$prefix}/permissions/{$this->permission_request_id}/attachments/{$this->id}/download");
        }

        return [
            'id'                  => $this->id,
            'permissionRequestId' => $this->permission_request_id,
            'fileName'            => $this->file_name,
            'originalFilename'    => $this->file_name,
            'downloadUrl'         => $downloadUrl,
            'fileUrl'             => $downloadUrl,
            'mimeType'            => $this->mime_type,
            'fileSize'            => $this->file_size,
            'createdAt'           => $this->created_at?->toISOString(),
        ];
    }
}
