import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { apiClient } from './apiClient';

// Ensure Pusher is accessible globally for Echo
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

const REVERB_APP_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REVERB_APP_KEY) ||
  'lombok-shorai-rinjani-local';

const REVERB_HOST =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REVERB_HOST) ||
  (typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1');

const REVERB_PORT =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REVERB_PORT)
    ? parseInt(import.meta.env.VITE_REVERB_PORT, 10)
    : 8080;

const REVERB_SCHEME =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REVERB_SCHEME) ||
  (typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http');

const rawAuthEndpoint =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_REVERB_AUTH_ENDPOINT) ||
  '/realtime/auth';

// Ensure consistent endpoint without double '/api' when called via apiClient (baseURL: /api)
const REVERB_AUTH_ENDPOINT = rawAuthEndpoint.startsWith('/api/')
  ? rawAuthEndpoint.slice(4)
  : rawAuthEndpoint;

let echoInstance = null;

/**
 * Get or create the singleton Laravel Echo instance configured for Reverb.
 */
export function getEchoInstance(token) {
  const authToken = token || (typeof window !== 'undefined' ? window.localStorage?.getItem('lpk_auth_token') : null);

  if (!authToken) {
    disconnectEcho();
    return null;
  }

  // If already instantiated, return existing instance
  if (echoInstance) {
    return echoInstance;
  }

  try {
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key: REVERB_APP_KEY,
      wsHost: REVERB_HOST,
      wsPort: REVERB_PORT,
      wssPort: REVERB_PORT,
      forceTLS: REVERB_SCHEME === 'https',
      enabledTransports: ['ws', 'wss'],
      authorizer: (channel) => {
        return {
          authorize: (socketId, callback) => {
            const currentToken = typeof window !== 'undefined' ? window.localStorage?.getItem('lpk_auth_token') : null;
            if (!currentToken) {
              callback(new Error('No authentication token available for channel authorization.'), null);
              return;
            }

            apiClient
              .post(REVERB_AUTH_ENDPOINT, {
                socket_id: socketId,
                channel_name: channel.name,
              })
              .then((response) => {
                const data = response.data;
                const authData = data?.auth
                  ? data
                  : data?.data?.auth
                  ? { auth: data.data.auth }
                  : data;

                callback(null, authData);
              })
              .catch((error) => {
                callback(error, null);
              });
          },
        };
      },
    });

    return echoInstance;
  } catch (err) {
    console.error('Failed to initialize Laravel Echo with Reverb:', err);
    echoInstance = null;
    return null;
  }
}

/**
 * Cleanly disconnect and destroy the singleton Echo instance.
 */
export function disconnectEcho() {
  if (echoInstance) {
    try {
      echoInstance.disconnect();
    } catch (e) {
      // Ignore disconnect errors during teardown
    }
    echoInstance = null;
  }
}

export { REVERB_APP_KEY, REVERB_HOST, REVERB_PORT, REVERB_SCHEME, REVERB_AUTH_ENDPOINT };
