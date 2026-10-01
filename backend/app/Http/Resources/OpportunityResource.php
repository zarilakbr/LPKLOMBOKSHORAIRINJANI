<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpportunityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'sector'       => $this->sector,
            'location'     => $this->location,
            'salaryRange'  => $this->salary_range,
            'languageReq'  => $this->language_req,
            'ageReq'       => $this->age_req,
            'requirements' => $this->requirements ?? [],
            'benefits'     => $this->benefits ?? [],
            'description'  => $this->description,
            'image'        => $this->image,
            'status'       => $this->status,
            'createdAt'    => $this->created_at?->toISOString(),
        ];
    }
}
