import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import CartoonBus from './CartoonBus';
import { Sparkles, Navigation, Layers, MapPin } from 'lucide-react';

export default function MapView({
  location = { latitude: 17.6896, longitude: 83.0024, speed: 45 },
  stops = [],
  busNumber = 'AP-31-1234',
  routeName = 'Anakapalle → College Campus Gate'
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Mapbox Public Access Token (reads from VITE_MAPBOX_TOKEN or fallback)
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazMDA2gycXA4Zj84dGQ5ZXkifQ.n-GCsnR7EgZMIznW9qGfrA';
  mapboxgl.accessToken = mapboxToken;

  const currentLat = location?.latitude || 17.6896;
  const currentLng = location?.longitude || 83.0024;

  const pathCoords = stops.length > 0
    ? stops.map(s => [Number(s.longitude), Number(s.latitude)])
    : [
        [83.0024, 17.6896],
        [83.0210, 17.7021],
        [83.0450, 17.7180],
        [83.0780, 17.7342]
      ];

  // Initialize Mapbox GL Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Mapbox Dark Vector Style
        center: [currentLng, currentLat],
        zoom: 13,
        pitch: 45, // 3D Tilt perspective
        bearing: -17.6
      });

      mapRef.current = map;

      // Add Mapbox Navigation Controls (Zoom & Pitch)
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        setMapLoaded(true);

        // Add Route Line Source & Layer
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
            'line-opacity': 0.85
          }
        });

        // Add Stop Markers
        stops.forEach((stop, idx) => {
          const el = document.createElement('div');
          el.className = 'w-6 h-6 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-300 font-bold flex items-center justify-center text-[10px] shadow-lg cursor-pointer';
          el.innerText = `${idx + 1}`;

          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-1 font-sans text-slate-900"><strong class="text-xs font-bold">${stop.stop_name}</strong><br/><span class="text-[10px] text-slate-500">Stop #${stop.stop_order}</span></div>`
          );

          new mapboxgl.Marker(el)
            .setLngLat([Number(stop.longitude), Number(stop.latitude)])
            .setPopup(popup)
            .addTo(map);
        });

        // Add Animated Bus Marker
        const busEl = document.createElement('div');
        busEl.className = 'custom-bus-marker cursor-pointer flex flex-col items-center';
        busEl.innerHTML = `
          <div class="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-extrabold text-[10px] border border-amber-400/40 shadow-lg whitespace-nowrap mb-1">
            🚌 ${busNumber} (LIVE)
          </div>
          <div class="w-12 h-10 flex items-center justify-center">
            <img src="https://cdn-icons-png.flaticon.com/512/3448/3448339.png" class="w-10 h-10 drop-shadow-lg animate-bounce" />
          </div>
        `;

        busMarkerRef.current = new mapboxgl.Marker(busEl)
          .setLngLat([currentLng, currentLat])
          .addTo(map);
      });

    } catch (err) {
      console.warn('Mapbox GL JS Fallback active:', err.message);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Smoothly pan Mapbox camera and update marker on location change
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      mapRef.current.panTo([currentLng, currentLat], { duration: 1000 });
      if (busMarkerRef.current) {
        busMarkerRef.current.setLngLat([currentLng, currentLat]);
      }
    }
  }, [currentLat, currentLng, mapLoaded]);

  return (
    <div className="w-full h-full relative min-h-[420px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* Mapbox Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Mapbox Top Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-white">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-amber-400" />
          MAPBOX GL VECTOR MAP
        </span>
        <div className="text-xs font-extrabold text-white">{busNumber}</div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="text-xs font-bold text-emerald-400">
          {location.speed || 42} km/h
        </div>
      </div>

      {/* Mapbox Bottom Telemetry Status Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between text-[11px] text-slate-300 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span>Route: <strong className="text-white font-semibold">{routeName}</strong></span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>Lat: <strong className="text-amber-300">{Number(currentLat).toFixed(4)}</strong></span>
          <span>Lng: <strong className="text-amber-300">{Number(currentLng).toFixed(4)}</strong></span>
        </div>
      </div>

    </div>
  );
}
