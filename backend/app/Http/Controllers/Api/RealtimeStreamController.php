<?php

namespace App\Http\Controllers\Api;

use App\Models\Notification;
use App\Services\RealtimeEventBus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class RealtimeStreamController extends BaseApiController
{
    /**
     * Get authorized realtime events for the authenticated user since a given timestamp.
     * Perfect for reconnect re-sync and instant delta retrieval.
     */
    public function events(Request $request): JsonResponse
    {
        $user = $request->user();
        $since = $request->filled('since') ? (float) $request->since : null;

        $events = RealtimeEventBus::getEventsForUser($user, $since);
        $channels = RealtimeEventBus::getAuthorizedChannelsForUser($user);

        $unreadCount = Notification::where('user_id', $user->id)
            ->where('is_read', false)
            ->count();

        return $this->sendResponse([
            'channels'    => $channels,
            'unreadCount' => $unreadCount,
            'serverTime'  => microtime(true),
            'events'      => $events,
        ], 'Realtime events fetched successfully.');
    }

    /**
     * Native Server-Sent Events (SSE) stream for live realtime push to React.
     */
    public function stream(Request $request): StreamedResponse
    {
        $user = $request->user();
        $authorizedChannels = RealtimeEventBus::getAuthorizedChannelsForUser($user);
        $lastEventTime = $request->hasHeader('Last-Event-ID')
            ? (float) $request->header('Last-Event-ID')
            : microtime(true);

        return response()->stream(function () use ($user, $authorizedChannels, $lastEventTime) {
            // Disable execution time limit for long-lived stream
            if (function_exists('set_time_limit')) {
                @set_time_limit(0);
            }

            // Send initial connection event
            echo "event: connection\n";
            echo 'data: ' . json_encode([
                'status'    => 'CONNECTED',
                'userId'    => $user->id,
                'role'      => $user->role,
                'channels'  => $authorizedChannels,
                'timestamp' => microtime(true),
            ]) . "\n\n";

            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();

            $currentTime = $lastEventTime;
            $iterations = 0;
            $maxIterations = 20; // 20 iterations (~10 seconds) to avoid hanging workers in single-threaded dev

            while (!connection_aborted() && $iterations < $maxIterations) {
                $newEvents = RealtimeEventBus::getEventsForUser($user, $currentTime);

                if (!empty($newEvents)) {
                    foreach ($newEvents as $ev) {
                        $currentTime = max($currentTime, (float) ($ev['timestamp'] ?? microtime(true)));
                        echo "id: {$currentTime}\n";
                        echo "event: {$ev['event']}\n";
                        echo 'data: ' . json_encode($ev['data']) . "\n\n";
                    }

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }

                // Heartbeat ping every cycle
                echo ": ping\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();

                usleep(500000); // 500ms poll interval
                $iterations++;
            }
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache, no-store, must-revalidate',
            'Connection'        => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Channel authorization check endpoint.
     */
    public function authorizeChannel(Request $request): JsonResponse
    {
        $request->validate([
            'channel_name' => 'required|string',
        ]);

        $user = $request->user();
        $channel = $request->channel_name;

        $isAuthorized = RealtimeEventBus::isUserAuthorizedForChannel($user, $channel);

        if (!$isAuthorized) {
            return $this->sendError('Akses channel ditolak.', [], 403);
        }

        $authSignature = null;
        if ($request->filled('socket_id')) {
            try {
                $broadcastAuth = \Illuminate\Support\Facades\Broadcast::auth($request);
                if (is_array($broadcastAuth)) {
                    $authSignature = $broadcastAuth['auth'] ?? null;
                } elseif (is_string($broadcastAuth)) {
                    $decoded = json_decode($broadcastAuth, true);
                    $authSignature = $decoded['auth'] ?? null;
                }
            } catch (\Throwable $e) {
                return $this->sendError('Akses channel ditolak.', [], 403);
            }
        }

        $responseData = [
            'authorized'   => true,
            'channel'      => $channel,
            'userId'       => $user->id,
        ];
        if ($authSignature) {
            $responseData['auth'] = $authSignature;
        }

        $responsePayload = [
            'success' => true,
            'message' => 'Channel authorized successfully.',
            'data'    => $responseData,
        ];
        if ($authSignature) {
            $responsePayload['auth'] = $authSignature;
        }

        return response()->json($responsePayload, 200);
    }
}
