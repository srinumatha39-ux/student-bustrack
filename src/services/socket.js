import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location && window.location.protocol === 'https:') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

let socket = null;

export const initSocket = () => {
  if (!socket) {
    try {
      socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnectionAttempts: 3,
        timeout: 3000
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected to backend real-time server:', socket.id);
      });

      socket.on('connect_error', () => {
        console.warn('[Socket] Connection failed. Using local event bus fallback.');
      });
    } catch (e) {
      console.warn('[Socket] Socket init error. Falling back to local events.', e);
    }
  }
  return socket;
};

// Global Event Broadcaster (Works with Socket.IO AND Local Browser Events)
export const broadcastLocation = (bus_id, latitude, longitude, speed = 40, isDemo = false) => {
  const payload = { bus_id, latitude, longitude, speed, isDemo, updated_at: new Date().toISOString() };
  
  if (socket && socket.connected) {
    socket.emit('location-update', payload);
  }

  // Also dispatch local CustomEvent so student/admin tabs update instantly in demo mode!
  window.dispatchEvent(new CustomEvent('bus_location_update', { detail: payload }));
};

export const subscribeToLocation = (busId, callback) => {
  // Local Event Handler
  const handleLocalEvent = (e) => {
    if (e.detail && e.detail.bus_id === busId) {
      callback(e.detail);
    }
  };
  window.addEventListener('bus_location_update', handleLocalEvent);

  // Socket IO Handler
  const s = initSocket();
  const socketHandler = (data) => {
    if (data.bus_id === busId) {
      callback(data);
    }
  };
  
  if (s) {
    s.on('bus-location-changed', socketHandler);
  }

  // Cleanup function
  return () => {
    window.removeEventListener('bus_location_update', handleLocalEvent);
    if (s) {
      s.off('bus-location-changed', socketHandler);
    }
  };
};

export const emitTripStart = (bus_id, driver_id, initial_location) => {
  const s = initSocket();
  if (s && s.connected) {
    s.emit('start-trip', { bus_id, driver_id, initial_location });
  }
  window.dispatchEvent(new CustomEvent('bus_status_change', { detail: { bus_id, status: 'LIVE' } }));
};

export const emitTripStop = (bus_id) => {
  const s = initSocket();
  if (s && s.connected) {
    s.emit('stop-trip', { bus_id });
  }
  window.dispatchEvent(new CustomEvent('bus_status_change', { detail: { bus_id, status: 'INACTIVE' } }));
};
