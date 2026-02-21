import { io } from 'socket.io-client';

// Derive socket URL from the API base URL (strip /api suffix)
const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const socketUrl = apiBase.replace(/\/api\/?$/, '') || undefined;

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  withCredentials: true,
});

export default socket;
