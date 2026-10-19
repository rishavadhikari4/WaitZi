import { io } from 'socket.io-client';

import { getAccessToken } from '../api/axios';

// Socket URL = API base without the /api suffix.
const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const socketUrl = apiBase.replace(/\/api\/?$/, '') || undefined;

/**
 * Staff sockets prove who they are with the access token (handshake auth) or
 * the accessToken cookie; the server then only lets them into their own
 * organization's rooms. Call reconnectSocket() after login/logout so the
 * socket picks up the new identity.
 */
const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  withCredentials: true,
  auth: (cb) => {
    const token = getAccessToken();
    cb(token ? { token } : {});
  },
});

export function reconnectSocket() {
  socket.disconnect().connect();
}

export default socket;
