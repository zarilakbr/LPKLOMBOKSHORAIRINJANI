<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'classId'          => $this->class_id,
            'className'        => $this->class?->class_name ?? $this->class?->name,
            'teacherId'        => $this->teacher_id,
            'teacherName'      => $this->teacher?->name,
            'title'            => $this->title,
            'description'      => $this->description,
            'type'             => $this->type,
            'originalFilename' => $this->original_filename,
            'mimeType'         => $this->mime_type,
            'fileSize'         => $this->file_size,
            'externalUrl'      => $this->external_url,
            'hasFile'          => !empty($this->file_path),
            'isPublished'      => (bool) $this->is_published,
            'publishedAt'      => $this->published_at?->toISOString(),
            'createdAt'        => $this->created_at?->toISOString(),
            'updatedAt'        => $this->updated_at?->toISOString(),
        ];
    }
}
