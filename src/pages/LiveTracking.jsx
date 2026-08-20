import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { subscribeToLocation } from '../services/socket';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import CartoonBus from '../components/CartoonBus';
import {
  ArrowLeft, Clock, Gauge, Radio
} from 'lucide-react';

export default function LiveTracking() {
  const { busId } = useParams();
  const [bus, setBus] = useState(null);
  const [telemetry, setTelemetry] = useState({
    latitude: 17.6896,
    longitude: 83.0024,
    speed: 45,
    isDemo: false,
    updated_at: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    loadBusDetails();

    const unsubscribe = subscribeToLocation(busId, (data) => {
      setTelemetry({
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed || 40,
        isDemo: data.isDemo || false,
        updated_at: new Date().toLocaleTimeString()
      });
    });

    return () => {
      unsubscribe();
    };
  }, [busId]);

  const loadBusDetails = async () => {
    const buses = await api.get('/api/buses');
    if (Array.isArray(buses)) {
      const found = buses.find((b) => b.id === busId);
      if (found) {
        setBus(found);
        if (found.stops && found.stops.length > 0) {
          setTelemetry(prev => ({
            ...prev,
            latitude: Number(found.stops[0].latitude),
            longitude: Number(found.stops[0].longitude)
          }));
        }
      }
    }
  };

  const defaultStops = bus?.stops || [
    { id: 'st1', stop_name: 'Anakapalle Ring Road', latitude: 17.6896, longitude: 83.0024, stop_order: 1 },
    { id: 'st2', stop_name: 'Main Road Junction', latitude: 17.7021, longitude: 83.0210, stop_order: 2 },
    { id: 'st3', stop_name: 'Railway Station Gate', latitude: 17.7180, longitude: 83.0450, stop_order: 3 },
    { id: 'st4', stop_name: 'College Campus Gate', latitude: 17.7342, longitude: 83.0780, stop_order: 4 }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-6 flex flex-col space-y-6 text-white relative z-10">
      
      {/* Top Header Bar with Cartoon Bus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <Link
            to="/student/dashboard"
            className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <CartoonBus size="md" isDriving={true} />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {bus?.bus_number || 'AP-31-1234'}
              </h1>
              <StatusBadge status={bus?.status || 'LIVE'} />
            </div>
            <p className="text-xs text-amber-400 font-medium">
              {bus?.route_name || 'Anakapalle → College Campus'}
            </p>
          </div>
        </div>

        {/* Telemetry Pill Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span>{telemetry.speed} km/h</span>
          </div>

          <div className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>ETA: ~18 mins</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Route Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        
        {/* Map Column */}
        <div className="lg:col-span-2 min-h-[420px] lg:min-h-[550px] relative">
          <MapView
            location={telemetry}
            stops={defaultStops}
            busNumber={bus?.bus_number || 'AP-31-1234'}
            routeName={bus?.route_name || 'Anakapalle → College Campus'}
          />
        </div>

        {/* Live Trip Details Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>Telemetry Status</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                Updated: {telemetry.updated_at}
              </span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 font-medium">Driver:</span>
                <strong className="text-white font-bold">{bus?.driver_name || 'Ramesh Kumar'}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Latitude</span>
                  <strong className="font-mono text-white">{Number(telemetry.latitude).toFixed(4)}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Longitude</span>
                  <strong className="font-mono text-white">{Number(telemetry.longitude).toFixed(4)}</strong>
                </div>
              </div>

              {telemetry.isDemo && (
                <div className="bg-amber-500/10 text-amber-300 p-3 rounded-xl border border-amber-500/30 text-[11px] font-semibold flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Showing DEMO Cartoon GPS stream</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">
              Route Stop Schedule
            </h3>

            <div className="space-y-3 relative pl-2">
              <div className="absolute left-[17px] top-3 bottom-3 w-0.5 bg-slate-800" />
              
              {defaultStops.map((stop, idx) => {
                const isPassed = idx === 0;
                return (
                  <div key={stop.id || idx} className="flex items-start gap-3 relative z-10">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      isPassed
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg'
                        : 'bg-slate-900 text-slate-400 border-slate-700'
                    }`}>
                      {idx + 1}
                    </div>

                    <div className="flex-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                      <div className="font-bold text-slate-200">{stop.stop_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {stop.latitude}, {stop.longitude}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
