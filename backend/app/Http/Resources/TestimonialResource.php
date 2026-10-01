<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'avatar'    => $this->avatar,
            'program'   => $this->program,
            'placement' => $this->placement,
            'quote'     => $this->quote,
            'year'      => $this->year,
            'badge'     => $this->badge,
            'status'    => $this->status,
        ];
    }
}
