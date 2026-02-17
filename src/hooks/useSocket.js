import { useEffect, useState, useRef } from 'react';
import socket from '../utils/socket';

/**
 * Hook to join Socket.IO rooms and listen for events.
 *
 * @param {string[]} rooms - Room names to join (e.g., ['kitchen', 'table:abc123'])
 * @param {Record<string, (data: any) => void>} events - Map of event name → handler
 */
export default function useSocket(rooms = [], events = {}) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const eventsRef = useRef(events);

  // Keep events ref up to date without re-subscribing
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      // Join rooms on connect (and re-connect)
      if (rooms.length > 0) {
        socket.emit('join', rooms);
      }
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    // If already connected, join rooms immediately
    if (socket.connected && rooms.length > 0) {
      socket.emit('join', rooms);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Create stable wrappers for each event that delegate to current ref
    const eventNames = Object.keys(eventsRef.current);
    const wrappers = {};
    eventNames.forEach((eventName) => {
      const wrapper = (data) => eventsRef.current[eventName]?.(data);
      wrappers[eventName] = wrapper;
      socket.on(eventName, wrapper);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);

      // Clean up event listeners
      Object.entries(wrappers).forEach(([eventName, wrapper]) => {
        socket.off(eventName, wrapper);
      });

      // Leave rooms
      if (rooms.length > 0) {
        socket.emit('leave', rooms);
      }
    };
  }, [rooms.join(',')]); // Re-subscribe when rooms change

  return { isConnected };
}
