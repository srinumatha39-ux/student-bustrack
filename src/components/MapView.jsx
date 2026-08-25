import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation, MapPin, Clock, Gauge, ShieldCheck, User } from 'lucide-react';

// Haversine formula to compute exact distance in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate ETA in minutes based on distance & current bus speed
function calculateEtaMinutes(distanceKm, speedKmh) {
  const effectiveSpeed = Math.max(speedKmh || 35, 15); // Min fallback 15 km/h for traffic realism
  const hours = distanceKm / effectiveSpeed;
  const minutes = Math.round(hours * 60);
  return minutes < 1 ? '< 1 min' : `${minutes} mins`;
}

export default function MapView({
  location = { latitude: 17.6896, longitude: 83.0024, speed: 45 },
  stops = [],
  busNumber = 'AP-31-1234',
  routeName = 'Anakapalle → College Campus Gate',
  driverName = 'Enrolled College Driver'
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStopEta, setSelectedStopEta] = useState(null);

  const currentLat = Number(location?.latitude || 17.6896);
  const currentLng = Number(location?.longitude || 83.0024);
  const currentSpeed = Number(location?.speed || 40);

  // Default path coordinates fallback if stops not loaded
  const pathCoords = stops.length > 0
    ? stops.map(s => [Number(s.longitude), Number(s.latitude)])
    : [
        [83.0024, 17.6896],
        [83.0210, 17.7021],
        [83.0450, 17.7180],
        [83.0780, 17.7342]
      ];

  // Initialize MapLibre GL Map Instance with OpenFreeMap Vector Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.openfreemap.org/styles/bright', // OpenFreeMap 100% Free Vector Style
        center: [currentLng, currentLat],
        zoom: 13.5,
        pitch: 45, // 3D perspective tilt
        bearing: -15
      });

      mapRef.current = map;

      // Add Navigation Controls (Zoom, Pitch, Rotate)
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.on('load', () => {
        setMapLoaded(true);

        // 1. Add Route Polyline Source & Layer
        map.addSource('bus-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: pathCoords
            }
          }
        });

        map.addLayer({
          id: 'bus-route-line',
          type: 'line',
          source: 'bus-route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#f59e0b',
            'line-width': 6,
            'line-opacity': 0.9
          }
        });

        // 2. Add Live Bus Drone GeoJSON Source for Smooth MapLibre Tracking
        const initialDroneData = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [currentLng, currentLat]
          },
          properties: {
            busNumber,
            speed: currentSpeed
          }
        };

        map.addSource('drone', {
          type: 'geojson',
          data: initialDroneData
        });

        // 3. Add Custom Animated Live Bus Marker
        const busEl = document.createElement('div');
        busEl.className = 'custom-bus-marker cursor-pointer flex flex-col items-center group';
        busEl.innerHTML = `
          <div class="px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 font-black text-[11px] border border-amber-400/60 shadow-2xl flex items-center gap-1 whitespace-nowrap mb-1">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            🚌 ${busNumber} (${driverName})
          </div>
          <div class="w-12 h-12 flex items-center justify-center bg-amber-400/20 backdrop-blur-md rounded-full border border-amber-400 shadow-xl">
            <img src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" class="w-9 h-9 drop-shadow-xl animate-bounce" alt="Bus Marker" />
          </div>
        `;

        busMarkerRef.current = new maplibregl.Marker({ element: busEl })
          .setLngLat([currentLng, currentLat])
          .addTo(map);

        // 4. Add Interactive Stop Markers with Real-Time Calculated ETA
        stops.forEach((stop, idx) => {
          const stopLat = Number(stop.latitude);
          const stopLng = Number(stop.longitude);
          const distKm = calculateDistanceKm(currentLat, currentLng, stopLat, stopLng);
          const etaStr = calculateEtaMinutes(distKm, currentSpeed);

          const el = document.createElement('div');
          el.className = 'w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-300 font-extrabold flex items-center justify-center text-[11px] shadow-2xl cursor-pointer hover:scale-110 transition-transform';
          el.innerText = `${idx + 1}`;

          const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2 font-sans text-slate-900 max-w-[200px]">
              <div class="flex items-center gap-1 text-amber-600 font-extrabold text-xs">
                <span>📍 Stop #${stop.stop_order}</span>
              </div>
              <h4 class="font-extrabold text-sm text-slate-900 mt-0.5">${stop.stop_name}</h4>
              <div class="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span class="text-slate-500">Distance:</span>
                <strong class="text-slate-800 font-bold">${distKm.toFixed(1)} km</strong>
              </div>
              <div class="mt-1 flex items-center justify-between text-xs bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                <span class="text-amber-800 font-semibold flex items-center gap-1">⏱️ Live ETA:</span>
                <strong class="text-amber-900 font-black text-sm">${etaStr}</strong>
              </div>
            </div>
          `);

          new maplibregl.Marker({ element: el })
            .setLngLat([stopLng, stopLat])
            .setPopup(popup)
            .addTo(map);
        });

      });

    } catch (err) {
      console.warn('[MapLibre] Fallback active:', err.message);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Real-Time Live Bus Location Updates (setData + smooth flyTo camera tracking)
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const map = mapRef.current;
      const targetCoords = [currentLng, currentLat];

      // Update MapLibre GeoJSON Source Data
      const droneSource = map.getSource('drone');
      if (droneSource) {
        droneSource.setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: targetCoords
          },
          properties: {
            busNumber,
            speed: currentSpeed
          }
        });
      }

      // Smooth FlyTo Camera Movement
      map.flyTo({
        center: targetCoords,
        speed: 0.8,
        essential: true
      });

      // Move Custom Animated Bus Marker
      if (busMarkerRef.current) {
        busMarkerRef.current.setLngLat(targetCoords);
      }

      // Calculate nearest stop ETA for status banner
      if (stops.length > 0) {
        const nextStop = stops[0];
        const dist = calculateDistanceKm(currentLat, currentLng, Number(nextStop.latitude), Number(nextStop.longitude));
        const eta = calculateEtaMinutes(dist, currentSpeed);
        setSelectedStopEta({ stopName: nextStop.stop_name, eta, dist: dist.toFixed(1) });
      }
    }
  }, [currentLat, currentLng, currentSpeed, mapLoaded]);

  return (
    <div className="w-full h-full relative min-h-[440px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* MapLibre Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[440px]" />

      {/* Top Left OpenFreeMap Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-white">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-amber-400 animate-pulse" />
          MAPLIBRE GL • OPENFREEMAP
        </span>
        <div className="text-xs font-extrabold text-white">{busNumber}</div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5" />
          {currentSpeed} km/h
        </div>
      </div>

      {/* Top Right Live ETA Banner */}
      {selectedStopEta && (
        <div className="absolute top-4 right-14 z-10 bg-amber-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-amber-500/40 flex items-center gap-2 text-amber-200">
          <Clock className="w-4 h-4 text-amber-400 animate-bounce" />
          <div className="text-xs font-bold">
            <span>Next: <strong className="text-white">{selectedStopEta.stopName}</strong></span>
            <span className="ml-2 text-amber-300 font-black bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
              ETA {selectedStopEta.eta} ({selectedStopEta.dist} km)
            </span>
          </div>
        </div>
      )}

      {/* Bottom Telemetry Status Bar with Respective Selected Driver Name */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/30">
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Driver: <strong className="text-white font-black">{driverName}</strong></span>
          </div>
          <div className="h-3.5 w-px bg-slate-700 hidden sm:block" />
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">Route: <strong className="text-white font-semibold">{routeName}</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Lat: <strong className="text-amber-300">{currentLat.toFixed(4)}</strong></span>
          <span>Lng: <strong className="text-amber-300">{currentLng.toFixed(4)}</strong></span>
        </div>
      </div>

    </div>
  );
}
