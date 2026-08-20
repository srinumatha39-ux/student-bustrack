import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import BusCard from '../components/BusCard';
import MapView from '../components/MapView';
import CartoonBus from '../components/CartoonBus';
import { Search, MapPin, Sparkles, Navigation } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedMapBus, setSelectedMapBus] = useState(null);

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    const data = await api.get('/api/buses');
    if (Array.isArray(data)) {
      setBuses(data);
      if (data.length > 0) {
        setSelectedMapBus(data[0]);
      }
    }
  };

  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.bus_number.toLowerCase().includes(search.toLowerCase()) ||
      bus.route_name.toLowerCase().includes(search.toLowerCase()) ||
      bus.start_point.toLowerCase().includes(search.toLowerCase());

    if (filterStatus === 'LIVE') {
      return matchesSearch && (bus.status === 'LIVE' || bus.status === 'ACTIVE');
    }
    return matchesSearch;
  });

  const activeMapBus = selectedMapBus || buses[0] || {
    id: 'b1',
    bus_number: 'AP-31-1234',
    route_name: 'Anakapalle → College Campus Gate',
    stops: [
      { stop_name: 'Anakapalle Ring Road', latitude: 17.6896, longitude: 83.0024, stop_order: 1 },
      { stop_name: 'Main Road Junction', latitude: 17.7021, longitude: 83.0210, stop_order: 2 },
      { stop_name: 'Railway Station Gate', latitude: 17.7180, longitude: 83.0450, stop_order: 3 },
      { stop_name: 'College Campus Gate', latitude: 17.7342, longitude: 83.0780, stop_order: 4 }
    ]
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-8 text-white relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Student Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-md">
              <span>Live Campus Bus Directory</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome, {user?.name || 'Student'}!
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm font-medium max-w-xl">
              Track live college bus locations on the direct map below or select a bus to open dedicated live route telemetry.
            </p>
          </div>

          <div className="relative z-10">
            <CartoonBus size="xl" isDriving={true} />
          </div>
        </div>

        {/* DIRECT LIVE MAP VIEW IN STUDENT DASHBOARD */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white">Direct Live Map Tracking</h2>
                <p className="text-xs text-slate-400">Active bus marker: <strong className="text-amber-400">{activeMapBus.bus_number}</strong> ({activeMapBus.route_name})</p>
              </div>
            </div>

            {/* Quick Bus Switch Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              {buses.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedMapBus(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeMapBus.id === b.id
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  🚌 {b.bus_number}
                </button>
              ))}
            </div>
          </div>

          {/* Embedded Map Component */}
          <div className="h-[360px] sm:h-[440px] w-full rounded-2xl overflow-hidden border border-slate-800">
            <MapView
              location={{
                latitude: activeMapBus.stops?.[0]?.latitude || 17.6896,
                longitude: activeMapBus.stops?.[0]?.longitude || 83.0024,
                speed: 42
              }}
              stops={activeMapBus.stops || []}
              busNumber={activeMapBus.bus_number}
              routeName={activeMapBus.route_name}
            />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bus number, route name, or station..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Fleet ({buses.length})
            </button>
            <button
              onClick={() => setFilterStatus('LIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'LIVE'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              LIVE TRIPS ONLY ({buses.filter(b => b.status === 'LIVE' || b.status === 'ACTIVE').length})
            </button>
          </div>

        </div>

        {/* Bus List Cards Grid */}
        {filteredBuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
            <CartoonBus size="lg" isDriving={false} className="mx-auto" />
            <h3 className="font-bold text-white text-lg">No College Buses Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching college buses found for your search query. Try clearing filters.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
