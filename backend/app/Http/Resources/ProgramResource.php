<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'title'            => $this->title,
            'slug'             => $this->slug,
            'category'         => $this->category,
            'level'            => $this->level,
            'shortDescription' => $this->short_description,
            'fullDescription'  => $this->full_description,
            'duration'         => $this->duration,
            'schedule'         => $this->schedule,
            'curriculum'       => $this->curriculum ?? [],
            'targetAudience'   => $this->target_audience,
            'image'            => $this->image,
            'priceEstimate'    => $this->price_estimate,
            'badge'            => $this->badge,
            'status'           => $this->status,
            'order'            => $this->order,
        ];
    }
}
