import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { broadcastLocation, emitTripStart, emitTripStop } from '../services/socket';
import { api } from '../services/api';

const LocationContext = createContext(null);

// Route Waypoints for Demo GPS simulation (Anakapalle -> College Campus Route)
const DEMO_ROUTE_WAYPOINTS = [
  { latitude: 17.6896, longitude: 83.0024, name: 'Anakapalle Ring Road' },
  { latitude: 17.6955, longitude: 83.0112, name: 'Highway Toll Gate' },
  { latitude: 17.7021, longitude: 83.0210, name: 'Main Road Junction' },
  { latitude: 17.7110, longitude: 83.0345, name: 'Bypass Flyover' },
  { latitude: 17.7180, longitude: 83.0450, name: 'Railway Station Gate' },
  { latitude: 17.7265, longitude: 83.0612, name: 'Tech Park Avenue' },
  { latitude: 17.7342, longitude: 83.0780, name: 'College Campus Gate' }
];

export const LocationProvider = ({ children }) => {
  const [activeTrip, setActiveTrip] = useState(null); // { bus_id, driver_id, est_minutes, remaining_seconds }
  const [currentLocation, setCurrentLocation] = useState(null); // { latitude, longitude, speed, isDemo }
  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  const watchIdRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const waypointIndexRef = useRef(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const startTrip = async (busId, driverId, estimatedMinutes = 60, useSimulated = false) => {
    stopTracking();

    const initialLoc = DEMO_ROUTE_WAYPOINTS[0];
    setCurrentLocation({ ...initialLoc, speed: 42, isDemo: useSimulated });

    setActiveTrip({
      bus_id: busId,
      driver_id: driverId,
      estimated_minutes: estimatedMinutes,
      remaining_seconds: estimatedMinutes * 60,
      start_time: new Date()
    });

    // Update bus status in API database to LIVE
    try {
      await api.put(`/api/buses/${busId}`, { status: 'LIVE' });
    } catch (e) {
      console.warn('Could not update bus status via API:', e);
    }

    emitTripStart(busId, driverId, initialLoc);

    // Trip Timer Countdown
    timerIntervalRef.current = setInterval(() => {
      setActiveTrip(prev => {
        if (!prev) return null;
        if (prev.remaining_seconds <= 1) {
          stopTrip('Trip auto-completed based on estimated journey duration.');
          return null;
        }
        return { ...prev, remaining_seconds: prev.remaining_seconds - 1 };
      });
    }, 1000);

    if (useSimulated) {
      setIsSimulating(true);
      waypointIndexRef.current = 0;
      
      // Simulate moving along the route every 3.5 seconds
      simulationIntervalRef.current = setInterval(() => {
        waypointIndexRef.current = (waypointIndexRef.current + 1) % DEMO_ROUTE_WAYPOINTS.length;
        const currentPt = DEMO_ROUTE_WAYPOINTS[waypointIndexRef.current];
        const latJitter = (Math.random() - 0.5) * 0.0004;
        const lngJitter = (Math.random() - 0.5) * 0.0004;
        const newLat = currentPt.latitude + latJitter;
        const newLng = currentPt.longitude + lngJitter;
        const speed = Math.floor(35 + Math.random() * 20);

        const updated = { latitude: newLat, longitude: newLng, speed, isDemo: true };
        setCurrentLocation(updated);
        broadcastLocation(busId, newLat, newLng, speed, true);
      }, 3500);

    } else {
      // Real Mobile Browser Geolocation Tracking
      setIsSimulating(false);
      if (!navigator.geolocation) {
        setGpsError('Geolocation is not supported by your browser. Falling back to Demo GPS.');
        startTrip(busId, driverId, estimatedMinutes, true); // Fallback
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, speed } = pos.coords;
          const currentSpeed = speed ? Math.round(speed * 3.6) : 40;
          const updated = { latitude, longitude, speed: currentSpeed, isDemo: false };
          setCurrentLocation(updated);
          broadcastLocation(busId, latitude, longitude, currentSpeed, false);
        },
        (err) => {
          console.warn('GPS Error:', err.message);
          setGpsError(`GPS Error: ${err.message}. Switching to Demo Simulation.`);
          startTrip(busId, driverId, estimatedMinutes, true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );
    }
  };

  const stopTrip = async (reason = null) => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (activeTrip) {
      try {
        await api.put(`/api/buses/${activeTrip.bus_id}`, { status: 'INACTIVE' });
      } catch (e) {
        console.warn('Could not update bus status via API:', e);
      }
      emitTripStop(activeTrip.bus_id);
    }

    setActiveTrip(null);
    setIsSimulating(false);
    return reason || 'Trip stopped successfully';
  };

  const stopTracking = () => {
    if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  return (
    <LocationContext.Provider value={{
      activeTrip,
      currentLocation,
      isSimulating,
      gpsError,
      startTrip,
      stopTrip
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
