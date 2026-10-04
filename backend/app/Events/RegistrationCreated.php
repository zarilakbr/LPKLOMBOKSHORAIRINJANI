<?php

namespace App\Events;

use App\Models\Registration;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RegistrationCreated implements ShouldBroadcastNow, ShouldRescue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Registration $registration)
    {
        \App\Services\RealtimeEventBus::emit($this->broadcastAs(), ['admin'], $this->broadcastWith());
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'registration.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'           => $this->registration->id,
            'userId'       => $this->registration->user_id,
            'userName'     => $this->registration->user?->name ?? $this->registration->full_name,
            'userEmail'    => $this->registration->user?->email ?? $this->registration->email,
            'userPhone'    => $this->registration->user?->phone ?? $this->registration->phone,
            'programId'    => $this->registration->program_id,
            'programTitle' => $this->registration->program?->title,
            'status'       => $this->registration->status,
            'registeredAt' => $this->registration->registered_at?->toISOString() ?? $this->registration->created_at?->toISOString(),
            'createdAt'    => $this->registration->created_at?->toISOString(),
        ];
    }
}
