import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useRealtime(token, handlers) {
  const current = useRef(handlers);
  current.current = handlers;
  useEffect(() => {
    if (!token) return;
    const socket = io(import.meta.env.VITE_BACKEND_URL, { auth: { token }, withCredentials: true });
    socket.onAny((event, payload) => current.current[event]?.(payload));
    socket.on('connect', () => current.current.connect?.(socket));
    return () => socket.disconnect();
  }, [token]);
}
