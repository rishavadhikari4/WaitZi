import { useEffect, useRef, useState } from 'react';

import socket from '../utils/socket';

export type SocketHandlers = Record<string, (data: unknown) => void>;

/**
 * Join Socket.IO rooms (e.g. 'kitchen', 'table:<id>') and listen for events.
 * The server maps each room name into the caller's organization.
 */
export default function useSocket(rooms: string[] = [], events: SocketHandlers = {}) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      if (rooms.length > 0) socket.emit('join', rooms);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    if (socket.connected && rooms.length > 0) socket.emit('join', rooms);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Stable wrappers delegate to the latest handlers without re-subscribing.
    const wrappers: Record<string, (data: unknown) => void> = {};
    for (const eventName of Object.keys(eventsRef.current)) {
      const wrapper = (data: unknown) => eventsRef.current[eventName]?.(data);
      wrappers[eventName] = wrapper;
      socket.on(eventName, wrapper);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      for (const [eventName, wrapper] of Object.entries(wrappers)) socket.off(eventName, wrapper);
      if (rooms.length > 0) socket.emit('leave', rooms);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms.join(',')]); // re-subscribe when the room list changes

  return { isConnected };
}
