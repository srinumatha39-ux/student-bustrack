import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ReportModal from '../components/ReportModal';
import CartoonBus from '../components/CartoonBus';
import { Play, Square, AlertOctagon, Clock, Radio, Bus } from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useAuth();
  const { activeTrip, currentLocation, isSimulating, startTrip, stopTrip, gpsError } = useLocation();

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [useDemoSimulation, setUseDemoSimulation] = useState(false);
  const [collegeBuses, setCollegeBuses] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState('');

  useEffect(() => {
    loadCollegeBuses();
  }, [user]);

  const loadCollegeBuses = async () => {
    const data = await api.get('/api/buses');
    if (Array.isArray(data)) {
      const userCollegeBuses = data.filter(b => !user?.college_id || b.college_id === user.college_id || b.college_id === 'DEFAULT');
      setCollegeBuses(userCollegeBuses);
      
      const assigned = userCollegeBuses.find(b => b.id === user?.assigned_bus_id || b.driver_id === user?.driver_id);
      if (assigned) {
        setSelectedBusId(assigned.id);
      } else if (userCollegeBuses.length > 0) {
        setSelectedBusId(userCollegeBuses[0].id);
      }
    }
  };

  const selectedBusObj = collegeBuses.find(b => b.id === selectedBusId) || user?.assigned_bus || {
    id: selectedBusId || 'b1',
    bus_number: 'AP-31-1234',
    bus_name: 'Campus Shuttle #1',
    route_name: 'Anakapalle → College Campus Gate',
    estimated_time: 60,
    stops: [
      { stop_name: 'Anakapalle Ring Road' },
      { stop_name: 'Main Road Junction' },
      { stop_name: 'Railway Station Gate' },
      { stop_name: 'College Campus Gate' }
    ]
  };

  const handleStartTrip = () => {
    const targetBusId = selectedBusObj.id || 'b1';
    startTrip(targetBusId, user?.driver_id || 'DRV-01', selectedBusObj.estimated_time || 60, useDemoSimulation);
  };

  const handleStopTrip = () => {
    stopTrip('Trip completed by transit operator.');
  };

  const formatTimer = (totalSeconds) => {
    if (!totalSeconds || totalSeconds < 0) return '00:00';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-8 text-white relative z-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 rounded-3xl p-6 sm:p-8 text-slate-950 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <CartoonBus size="lg" isDriving={Boolean(activeTrip)} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 font-bold text-xs mb-2">
                <span>Route Operations Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Operator Console — {user?.name || 'Authorized Operator'}
              </h1>
              <p className="text-xs font-bold opacity-90 mt-1">
                Operator ID: {user?.driver_id || 'DRV-01'} | College: {user?.college_id || 'Campus Network'}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-950/10 text-right self-start md:self-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1">Route Status</div>
            <StatusBadge status={activeTrip ? 'LIVE' : 'INACTIVE'} />
          </div>
        </div>

        {gpsError && (
          <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-between">
            <span>{gpsError}</span>
          </div>
        )}

        {/* TRIP CONTROL PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="font-extrabold text-lg text-white">Route Telemetry Controls</h2>
                <p className="text-xs text-slate-400">High-frequency GPS broadcast to passenger network</p>
              </div>

              {!activeTrip && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-300 bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  <input
                    type="checkbox"
                    checked={useDemoSimulation}
                    onChange={(e) => setUseDemoSimulation(e.target.checked)}
                    className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400"
                  />
                  <span>Simulate Route GPS</span>
                </label>
              )}
            </div>

            {/* Select Vehicle to Dispatch */}
            {!activeTrip && collegeBuses.length > 0 && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Bus className="w-4 h-4 text-amber-400" />
                  Select Vehicle to Dispatch:
                </label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-bold text-amber-300 focus:ring-2 focus:ring-amber-500"
                >
                  {collegeBuses.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                      🚌 {b.bus_number} — {b.route_name || b.bus_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTrip ? (
              <div className="bg-slate-950 rounded-2xl p-6 text-white space-y-6 shadow-inner border border-slate-800 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <CartoonBus size="sm" isDriving={true} />
                    <span className="font-extrabold text-sm text-emerald-400 tracking-wide">
                      ACTIVE ROUTE DISPATCH — LIVE TELEMETRY
                    </span>
                  </div>

                  <div className="text-xs font-mono bg-slate-900 px-3 py-1 rounded-full text-amber-300 font-bold border border-slate-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Timer: {formatTimer(activeTrip.remaining_seconds)}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vehicle Identification</span>
                    <div className="font-extrabold text-amber-400 text-sm">{selectedBusObj.bus_number}</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Velocity</span>
                    <div className="font-extrabold text-emerald-400 text-sm">{currentLocation?.speed || 42} km/h</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Latitude</span>
                    <div className="font-mono text-white text-xs">{currentLocation?.latitude ? Number(currentLocation.latitude).toFixed(4) : '17.6896'}</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Longitude</span>
                    <div className="font-mono text-white text-xs">{currentLocation?.longitude ? Number(currentLocation.longitude).toFixed(4) : '83.0024'}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Telemetry Feed: {isSimulating ? 'WAYPOINT GPS ROUTE' : 'DEVICE NATIVE GPS'}</span>
                  </div>
                  <span>Automatic Journey Timer Enabled ({selectedBusObj.estimated_time || 60} mins)</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 space-y-3">
                <CartoonBus size="lg" isDriving={false} className="mx-auto" />
                <h3 className="font-bold text-white text-base">Ready to Initiate Route Dispatch?</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Clicking "INITIATE ROUTE DISPATCH" broadcasts continuous vehicle telemetry to passenger map dashboards.
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {!activeTrip ? (
                <button
                  onClick={handleStartTrip}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 shadow-xl shadow-amber-500/25 transition-all transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  INITIATE ROUTE DISPATCH
                </button>
              ) : (
                <button
                  onClick={handleStopTrip}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/25 transition-all transform active:scale-95"
                >
                  <Square className="w-5 h-5 fill-current" />
                  CONCLUDE ROUTE DISPATCH
                </button>
              )}

              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-extrabold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
              >
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                REPORT HAZARD / DELAY
              </button>
            </div>

          </div>

          <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">
              Assigned Route Waypoints
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 font-medium">Route:</span>
                <strong className="block text-white font-bold">{selectedBusObj.route_name}</strong>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Scheduled Duration:</span>
                <strong className="block text-white font-bold">{selectedBusObj.estimated_time || 60} Minutes</strong>
              </div>

              <div className="pt-2">
                <span className="font-bold text-slate-200 block mb-2">Configured Stops:</span>
                <div className="space-y-2 border-l-2 border-amber-400 ml-2 pl-3">
                  {selectedBusObj.stops?.map((st, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950" />
                      <div className="font-bold text-slate-200">{i + 1}. {st.stop_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        driver={user}
        currentLocation={currentLocation}
      />
    </div>
  );
}
