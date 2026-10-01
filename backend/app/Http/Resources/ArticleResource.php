<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'slug'        => $this->slug,
            'excerpt'     => $this->excerpt,
            'content'     => $this->content,
            'thumbnail'   => $this->thumbnail,
            'author'      => $this->author,
            'category'    => $this->category,
            'tags'        => $this->tags ?? [],
            'readTime'    => $this->read_time,
            'publishedAt' => $this->published_at?->format('Y-m-d'),
            'status'      => $this->status,
            'createdAt'   => $this->created_at?->toISOString(),
        ];
    }
}
