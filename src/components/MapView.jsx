import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import CartoonBus from './CartoonBus';
import { Sparkles, Activity } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem'
};

const defaultCenter = {
  lat: 17.7120,
  lng: 83.0400
};

export default function MapView({
  location = { latitude: 17.6896, longitude: 83.0024, speed: 45 },
  stops = [],
  busNumber = 'AP-31-1234',
  routeName = 'Anakapalle → College Campus Gate'
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isGoogleMapsConfigured = Boolean(apiKey && apiKey !== 'your_google_maps_api_key_here');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: isGoogleMapsConfigured ? apiKey : '',
    id: 'google-map-script'
  });

  const [selectedStop, setSelectedStop] = useState(null);

  const busCenter = {
    lat: location?.latitude || defaultCenter.lat,
    lng: location?.longitude || defaultCenter.lng
  };

  const pathCoords = stops.length > 0
    ? stops.map(s => ({ lat: Number(s.latitude), lng: Number(s.longitude) }))
    : [
        { lat: 17.6896, lng: 83.0024 },
        { lat: 17.7021, lng: 83.0210 },
        { lat: 17.7180, lng: 83.0450 },
        { lat: 17.7342, lng: 83.0780 }
      ];

  if (isGoogleMapsConfigured && isLoaded && !loadError) {
    return (
      <div className="w-full h-full relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={busCenter}
          zoom={13}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false
          }}
        >
          <Polyline
            path={pathCoords}
            options={{
              strokeColor: '#f59e0b',
              strokeOpacity: 0.9,
              strokeWeight: 6
            }}
          />

          {stops.map((stop, idx) => (
            <Marker
              key={stop.id || idx}
              position={{ lat: Number(stop.latitude), lng: Number(stop.longitude) }}
              onClick={() => setSelectedStop(stop)}
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/amber-dot.png'
              }}
            />
          ))}

          <Marker
            position={busCenter}
            icon={{
              url: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
              scaledSize: new window.google.maps.Size(48, 48)
            }}
          />

          {selectedStop && (
            <InfoWindow
              position={{ lat: Number(selectedStop.latitude), lng: Number(selectedStop.longitude) }}
              onCloseClick={() => setSelectedStop(null)}
            >
              <div className="p-1 font-sans">
                <h4 className="font-bold text-xs text-slate-900">{selectedStop.stop_name}</h4>
                <p className="text-[10px] text-slate-500">Stop #{selectedStop.stop_order}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

        <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 text-white">
          <CartoonBus size="sm" isDriving={true} />
          <div className="text-xs font-bold">{busNumber}</div>
          <div className="h-4 w-px bg-slate-700" />
          <div className="text-xs font-bold text-emerald-400">
            {location.speed || 40} km/h
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // INTERACTIVE VECTOR TELEMETRY MAP
  // ============================================================
  return (
    <div className="w-full h-full relative min-h-[420px] bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col justify-between p-4 sm:p-6">
      
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Header Overlay */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            3D ROUTE TELEMETRY MAP
          </span>
          <span className="text-xs font-semibold text-slate-300">{routeName}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">Lat: <strong className="text-white font-mono">{Number(location.latitude).toFixed(4)}</strong></span>
          <span className="text-slate-400">Lng: <strong className="text-white font-mono">{Number(location.longitude).toFixed(4)}</strong></span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
            {location.speed || 42} km/h
          </span>
        </div>
      </div>

      {/* Animated Cartoon Bus Route Line */}
      <div className="relative z-10 flex-1 my-6 flex items-center justify-center">
        <div className="w-full max-w-3xl bg-slate-900/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-800 shadow-inner relative overflow-hidden">
          
          <div className="relative w-full h-16 flex items-center justify-between px-4">
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-400 w-full animate-pulse" />
            </div>

            {pathCoords.map((pt, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center group cursor-pointer">
                <div className="w-7 h-7 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-[10px] font-bold group-hover:scale-125 transition-transform shadow-lg">
                  {idx + 1}
                </div>
                <span className="absolute top-8 text-[10px] font-semibold text-slate-300 whitespace-nowrap bg-slate-950 px-2 py-0.5 rounded border border-slate-800 shadow">
                  {stops[idx]?.stop_name || `Stop ${idx + 1}`}
                </span>
              </div>
            ))}

            {/* Moving Animated Cartoon Bus Marker */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out"
              style={{
                left: `${Math.min(85, Math.max(12, ((location.latitude - 17.68) / 0.06) * 100))}%`
              }}
            >
              <div className="relative flex flex-col items-center">
                <CartoonBus size="md" isDriving={true} />
                <span className="text-[10px] font-extrabold text-amber-300 bg-slate-950 px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-lg whitespace-nowrap mt-1">
                  🚌 {busNumber} (LIVE)
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Real-time GPS telemetry active. Configure <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> for Satellite view.</span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold">Telemetry Stream Online</span>
        </div>
      </div>
    </div>
  );
}
