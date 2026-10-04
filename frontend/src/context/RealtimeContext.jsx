import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { apiClient, API_BASE_URL } from '../services/apiClient';
import { getEchoInstance, disconnectEcho } from '../services/reverb';

const RealtimeContext = createContext(null);

export const ConnectionStatus = {
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  FALLBACK: 'FALLBACK',
  ERROR: 'ERROR'
};

const KNOWN_EVENTS = [
  'registration.created',
  'enrollment.created',
  'enrollment.updated',
  'attendance.recorded',
  'attendance.updated',
  'permission.created',
  'permission.reviewed',
  'schedule.updated',
  'schedule.created',
  'schedule.deleted',
  'notification.created',
  'material.created',
  'material.updated',
  'material.deleted',
  'class.created',
  'class.updated',
  'class.deleted'
];

/**
 * Generate a deterministic deduplication key for an operational event.
 * Combines event name + stable entity ID + version/timestamp field.
 */
function getEventDedupeKey(eventName, data = {}) {
  if (!data) return `${eventName}:null`;

  switch (eventName) {
    case 'class.created':
      return `${eventName}:${data.id || ''}:${data.createdAt || data.className || ''}`;
    case 'class.updated':
      return `${eventName}:${data.id || ''}:${data.updatedAt || data.className || ''}`;
    case 'class.deleted':
      return `${eventName}:${data.id || ''}:${data.deletedAt || ''}`;
    case 'attendance.recorded':
      return `${eventName}:${data.id || ''}:${data.updatedAt || data.createdAt || data.attendanceDate || ''}`;
    case 'attendance.updated':
      return `${eventName}:${data.id || ''}:${data.updatedAt || data.status || ''}`;
    case 'enrollment.created':
      return `${eventName}:${data.id || ''}:${data.createdAt || `${data.userId}-${data.classId}`}`;
    case 'enrollment.updated':
      return `${eventName}:${data.id || ''}:${data.updatedAt || data.status || ''}`;
    case 'notification.created':
      return `${eventName}:${data.id || ''}:${data.createdAt || ''}`;
    case 'permission.created':
      return `${eventName}:${data.id || ''}:${data.createdAt || data.startDate || ''}`;
    case 'permission.reviewed':
      return `${eventName}:${data.id || ''}:${data.reviewedAt || data.status || ''}`;
    case 'registration.created':
      return `${eventName}:${data.id || ''}:${data.createdAt || data.email || ''}`;
    case 'schedule.created':
      return `${eventName}:${data.id || data.classId || ''}:${data.createdAt || data.date || ''}`;
    case 'schedule.updated':
      return `${eventName}:${data.id || data.classId || ''}:${data.updatedAt || `${data.schedule}-${data.location}`}`;
    case 'schedule.deleted':
      return `${eventName}:${data.id || ''}:${data.deletedAt || ''}`;
    case 'material.created':
      return `${eventName}:${data.id || ''}:${data.createdAt || data.publishedAt || ''}`;
    case 'material.updated':
      return `${eventName}:${data.id || ''}:${data.updatedAt || data.isPublished || ''}`;
    case 'material.deleted':
      return `${eventName}:${data.id || ''}:${data.deletedAt || ''}`;
    default:
      return `${eventName}:${data.id || JSON.stringify(data)}`;
  }
}

export function RealtimeProvider({ children }) {
  const [status, setStatus] = useState(ConnectionStatus.DISCONNECTED);
  const [lastEvent, setLastEvent] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const echoRef = useRef(null);
  const sseRef = useRef(null);
  const subscribedChannelsRef = useRef(new Set());
  const dedupeMapRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const listenersRef = useRef(new Map());
  const reconnectListenersRef = useRef(new Set());
  const lastTimestampRef = useRef(Date.now() / 1000);
  const wasConnectedRef = useRef(false);

  // Bounded deduplication check: returns true if event is unique, false if duplicate
  const shouldProcessEvent = useCallback((eventName, data) => {
    const dedupeKey = getEventDedupeKey(eventName, data);
    const now = Date.now();
    const DEDUPE_WINDOW_MS = 10000; // 10-second transport dedupe window
    const MAX_ENTRIES = 300;

    const lastSeen = dedupeMapRef.current.get(dedupeKey);
    if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
      // Duplicate received via secondary transport, suppress
      return false;
    }

    dedupeMapRef.current.set(dedupeKey, now);

    // Prune stale cache entries if cache size grows
    if (dedupeMapRef.current.size > MAX_ENTRIES) {
      for (const [k, time] of dedupeMapRef.current.entries()) {
        if (now - time > DEDUPE_WINDOW_MS) {
          dedupeMapRef.current.delete(k);
        }
      }
    }

    return true;
  }, []);

  // Register an event listener for a specific event name
  const on = useCallback((eventName, callback) => {
    if (!listenersRef.current.has(eventName)) {
      listenersRef.current.set(eventName, new Set());
    }
    listenersRef.current.get(eventName).add(callback);

    return () => {
      const set = listenersRef.current.get(eventName);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          listenersRef.current.delete(eventName);
        }
      }
    };
  }, []);

  // Register callback to run when reconnection occurs
  const onReconnect = useCallback((callback) => {
    reconnectListenersRef.current.add(callback);
    return () => {
      reconnectListenersRef.current.delete(callback);
    };
  }, []);

  // Centralized dispatch pipeline with deduplication
  const dispatchEvent = useCallback((eventObj) => {
    const { event, data, timestamp } = eventObj;

    // Run deduplication check
    if (!shouldProcessEvent(event, data)) {
      return;
    }

    setLastEvent(eventObj);
    if (timestamp) {
      lastTimestampRef.current = Math.max(lastTimestampRef.current, parseFloat(timestamp));
    }

    // Auto-update notification unread counter exactly once per unique notification
    if (event === 'notification.created') {
      setUnreadCount((prev) => prev + 1);
    }

    const listeners = listenersRef.current.get(event);
    if (listeners) {
      listeners.forEach((cb) => {
        try {
          cb(data, eventObj);
        } catch (err) {
          console.error(`Error in realtime listener for ${event}:`, err);
        }
      });
    }

    // Wildcard listeners
    const allListeners = listenersRef.current.get('*');
    if (allListeners) {
      allListeners.forEach((cb) => {
        try {
          cb(eventObj);
        } catch (err) {
          console.error('Error in wildcard realtime listener:', err);
        }
      });
    }
  }, [shouldProcessEvent]);

  // Delta Sync: Recover missed events via /api/realtime/events?since=<timestamp>
  const syncMissedEvents = useCallback(async () => {
    const token = typeof window !== 'undefined' ? window.localStorage?.getItem('lpk_auth_token') : null;
    if (!token) return { channels: [] };

    try {
      const res = await apiClient.get('/realtime/events', {
        params: { since: lastTimestampRef.current }
      });

      if (res?.data?.success && res.data.data) {
        const { events, unreadCount: count, serverTime, channels } = res.data.data;

        // Authoritative server unread count
        if (typeof count === 'number') {
          setUnreadCount(count);
        }

        // Dispatch recovered events through deduplication pipeline
        if (Array.isArray(events) && events.length > 0) {
          events.forEach((ev) => dispatchEvent(ev));
        }

        if (serverTime) {
          lastTimestampRef.current = Math.max(lastTimestampRef.current, parseFloat(serverTime));
        }

        // Trigger active consumer resync callbacks
        reconnectListenersRef.current.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            console.error('Error in onReconnect listener:', err);
          }
        });

        return { channels: channels || [] };
      }
    } catch (err) {
      console.warn('Delta sync on reconnect failed:', err?.message);
    }

    return { channels: [] };
  }, [dispatchEvent]);

  // Subscribe Echo to authorized channels returned by backend
  const subscribeToChannels = useCallback((echo, channels = []) => {
    if (!echo) return;

    channels.forEach((channelName) => {
      // Strip 'private-' prefix if present, as echo.private() handles it
      const cleanName = channelName.startsWith('private-')
        ? channelName.slice('private-'.length)
        : channelName;

      if (subscribedChannelsRef.current.has(cleanName)) {
        return;
      }

      try {
        const privateChannel = echo.private(cleanName);
        subscribedChannelsRef.current.add(cleanName);

        KNOWN_EVENTS.forEach((evtName) => {
          // Listen using leading dot for custom broadcastAs names
          privateChannel.listen(`.${evtName}`, (data) => {
            dispatchEvent({
              event: evtName,
              data,
              timestamp: Date.now() / 1000
            });
          });
          // Also bind without dot for standard event names
          privateChannel.listen(evtName, (data) => {
            dispatchEvent({
              event: evtName,
              data,
              timestamp: Date.now() / 1000
            });
          });
        });
      } catch (subErr) {
        console.warn(`Failed subscribing to channel ${cleanName}:`, subErr);
      }
    });
  }, [dispatchEvent]);

  // Fallback SSE Transport (Never passes token in query string)
  const tryFallbackSSE = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (sseRef.current) return;

    const token = window.localStorage?.getItem('lpk_auth_token');
    if (!token) return;

    try {
      const apiBase = API_BASE_URL;
      // Secure SSE connection without token in URL
      const es = new EventSource(`${apiBase}/realtime/stream`, { withCredentials: true });
      sseRef.current = es;

      es.addEventListener('connection', () => {
        setStatus(ConnectionStatus.FALLBACK);
        syncMissedEvents();
      });

      KNOWN_EVENTS.forEach((evtName) => {
        es.addEventListener(evtName, (e) => {
          try {
            const data = JSON.parse(e.data);
            dispatchEvent({
              event: evtName,
              data,
              timestamp: e.lastEventId || Date.now() / 1000
            });
          } catch (err) {
            console.error(`Failed parsing fallback SSE event ${evtName}:`, err);
          }
        });
      });

      es.onerror = () => {
        es.close();
        sseRef.current = null;
        // If SSE fails, delta sync handles catchup on reconnect
      };
    } catch (err) {
      console.warn('Fallback SSE initialization error:', err);
    }
  }, [dispatchEvent, syncMissedEvents]);

  // Connect to Primary Reverb / Echo transport
  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    const token = window.localStorage?.getItem('lpk_auth_token');
    if (!token) {
      setStatus(ConnectionStatus.DISCONNECTED);
      disconnectEcho();
      subscribedChannelsRef.current.clear();
      return;
    }

    setStatus(ConnectionStatus.CONNECTING);

    const echo = getEchoInstance(token);
    echoRef.current = echo;

    if (!echo) {
      tryFallbackSSE();
      return;
    }

    // Monitor Pusher underlying connection states
    if (echo.connector?.pusher) {
      const pusher = echo.connector.pusher;

      const handleConnected = async () => {
        setStatus(ConnectionStatus.CONNECTED);
        // Clean up SSE fallback if active since Reverb is alive
        if (sseRef.current) {
          sseRef.current.close();
          sseRef.current = null;
        }

        // Recover missed events and subscribe to authorized channels
        const { channels } = await syncMissedEvents();
        subscribeToChannels(echo, channels);

        if (wasConnectedRef.current) {
          // Reconnection occurred, trigger listeners
          reconnectListenersRef.current.forEach((cb) => {
            try { cb(); } catch (e) { console.error(e); }
          });
        }
        wasConnectedRef.current = true;
      };

      const handleConnecting = () => {
        setStatus(ConnectionStatus.CONNECTING);
      };

      const handleDisconnected = () => {
        setStatus(ConnectionStatus.CONNECTING);
      };

      const handleUnavailable = () => {
        setStatus(ConnectionStatus.DISCONNECTED);
        // Reverb failed/unavailable, trigger SSE fallback
        tryFallbackSSE();

        // Controlled backoff reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

      pusher.connection.bind('connected', handleConnected);
      pusher.connection.bind('connecting', handleConnecting);
      pusher.connection.bind('disconnected', handleDisconnected);
      pusher.connection.bind('unavailable', handleUnavailable);
      pusher.connection.bind('failed', handleUnavailable);

      // If already connected immediately
      if (pusher.connection.state === 'connected') {
        handleConnected();
      }
    } else {
      // Fallback if connector not initialized
      tryFallbackSSE();
    }
  }, [syncMissedEvents, subscribeToChannels, tryFallbackSSE]);

  // Teardown and reset on logout or token changes
  const cleanup = useCallback(() => {
    disconnectEcho();
    echoRef.current = null;
    subscribedChannelsRef.current.clear();

    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
    setUnreadCount(0);
    wasConnectedRef.current = false;
  }, []);

  // Monitor auth state changes & handle connect/disconnect
  useEffect(() => {
    connect();

    const handleStorageChange = (e) => {
      if (e.key === 'lpk_auth_token') {
        if (e.newValue) {
          cleanup();
          connect();
        } else {
          cleanup();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      cleanup();
    };
  }, [connect, cleanup]);

  const value = {
    status,
    isConnected: status === ConnectionStatus.CONNECTED,
    lastEvent,
    unreadCount,
    setUnreadCount,
    on,
    onReconnect,
    reconnect: connect
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}

export function useRealtimeEvent(eventName, callback) {
  const { on } = useRealtime();

  useEffect(() => {
    if (!eventName || !callback) return;
    const unbind = on(eventName, callback);
    return () => {
      unbind();
    };
  }, [on, eventName, callback]);
}
