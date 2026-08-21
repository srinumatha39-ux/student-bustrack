import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCollege } from '../context/CollegeContext';
import { api } from '../services/api';
import BusCard from '../components/BusCard';
import MapView from '../components/MapView';
import CartoonBus from '../components/CartoonBus';
import { Search, MapPin, Building2, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { collegesList, selectedCollege, setSelectedCollege, currentCollegeObj, isCollegeUnlocked, unlockCollegeWithCode } = useCollege();
  
  const [buses, setBuses] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedMapBus, setSelectedMapBus] = useState(null);

  // Security Code unlock modal states
  const [securityInput, setSecurityInput] = useState('');
  const [unlockError, setUnlockError] = useState(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  useEffect(() => {
    loadBuses();
  }, [selectedCollege]);

  const loadBuses = async () => {
    const data = await api.get('/api/buses');
    if (Array.isArray(data)) {
      setBuses(data);
      if (data.length > 0) {
        setSelectedMapBus(data[0]);
      }
    }
  };

  const handleUnlockSubmit = async (e) => {
    e.preventDefault();
    setUnlockError(null);
    setIsVerifyingCode(true);

    const targetCollegeId = selectedCollege !== 'ALL' ? selectedCollege : user?.college_id;
    const res = await unlockCollegeWithCode(targetCollegeId, securityInput);
    setIsVerifyingCode(false);

    if (res.success) {
      setSecurityInput('');
    } else {
      setUnlockError(res.message || 'Incorrect Security Code!');
    }
  };

  const targetCollegeId = selectedCollege !== 'ALL' ? selectedCollege : user?.college_id;
  const isUnlocked = isCollegeUnlocked(targetCollegeId);

  // Multi-College Filter Logic
  const filteredBuses = buses.filter((bus) => {
    const matchesSearch =
      bus.bus_number.toLowerCase().includes(search.toLowerCase()) ||
      bus.route_name.toLowerCase().includes(search.toLowerCase()) ||
      bus.start_point.toLowerCase().includes(search.toLowerCase());

    const matchesCollege =
      selectedCollege === 'ALL' ||
      bus.college_id === selectedCollege ||
      (user?.college_id && bus.college_id === user.college_id);

    if (filterStatus === 'LIVE') {
      return matchesSearch && matchesCollege && (bus.status === 'LIVE' || bus.status === 'ACTIVE');
    }
    return matchesSearch && matchesCollege;
  });

  const activeMapBus = selectedMapBus || filteredBuses[0] || buses[0] || {
    id: 'b1',
    bus_number: 'AP-31-1234',
    route_name: 'Campus Shuttle Route',
    stops: [
      { stop_name: 'Main Stop #1', latitude: 17.6896, longitude: 83.0024, stop_order: 1 },
      { stop_name: 'Campus Gate #2', latitude: 17.7342, longitude: 83.0780, stop_order: 2 }
    ]
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-8 text-white relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Student Welcome Banner */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-md">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentCollegeObj.name || 'Admin-Registered Campus Network'}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Welcome, {user?.name || 'Student'}!
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm font-medium max-w-xl">
              Track live shuttle locations for your college. Security Code created by Admin is required to view live locations.
            </p>
          </div>

          <div className="relative z-10">
            <CartoonBus size="xl" isDriving={true} />
          </div>
        </div>

        {/* SECURITY CODE PROTECTED LIVE MAP VIEW */}
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg text-white">Direct Mapbox 3D Tracking</h2>
                <p className="text-xs text-slate-400">
                  {isUnlocked ? (
                    <>Active bus marker: <strong className="text-amber-400">{activeMapBus.bus_number}</strong> ({activeMapBus.route_name})</>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1"><Lock className="w-3.5 h-3.5 inline" /> Security Code Protected</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Bus Switch Pills */}
            {isUnlocked && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                {filteredBuses.map((b) => (
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
            )}
          </div>

          {/* Embedded Map Component OR Security Code Unlock Card */}
          {isUnlocked ? (
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
          ) : (
            /* SECURITY CODE ENTRY CARD IF LOCKED */
            <div className="h-[360px] sm:h-[440px] w-full rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30 shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-extrabold text-white mb-2">College Security Code Required</h3>
              <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                Students are not able to view other college bus locations without knowing that college's <strong>Security Code created by the Admin</strong>.
              </p>

              {unlockError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 max-w-md">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}

              <form onSubmit={handleUnlockSubmit} className="w-full max-w-md space-y-3">
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={securityInput}
                    onChange={(e) => setSecurityInput(e.target.value)}
                    placeholder="Enter Security Code created by Admin"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-amber-500/40 text-xs font-semibold text-amber-300 focus:ring-2 focus:ring-amber-500 font-mono text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingCode}
                  className="w-full py-3 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isVerifyingCode ? 'Verifying Security Code...' : 'Unlock Bus Location & Map'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Filter & Search Bar with Dynamic Admin-Created Colleges */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 shadow-xl">
          
          {/* Dynamic Admin-Created Colleges Dropdown Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-amber-300 focus:ring-2 focus:ring-amber-500 w-full md:w-64"
            >
              {collegesList.length === 0 ? (
                <option value="NONE">No Registered Colleges Yet</option>
              ) : (
                collegesList.map((col) => (
                  <option key={col.id} value={col.college_id} className="bg-slate-900 text-white font-medium">
                    {col.name} ({col.college_id})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bus number, route..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-semibold text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Fleet ({filteredBuses.length})
            </button>
            <button
              onClick={() => setFilterStatus('LIVE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                filterStatus === 'LIVE'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              LIVE TRIPS ({filteredBuses.filter(b => b.status === 'LIVE' || b.status === 'ACTIVE').length})
            </button>
          </div>

        </div>

        {/* Bus List Cards Grid */}
        {isUnlocked ? (
          filteredBuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBuses.map((bus) => (
                <BusCard key={bus.id} bus={bus} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/90 rounded-3xl p-12 text-center border border-slate-800 space-y-3">
              <CartoonBus size="lg" isDriving={false} className="mx-auto" />
              <h3 className="font-bold text-white text-lg">No Buses Added for this College Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                The Administrator for this college has not added any buses yet. Click Admin Login to add fleet buses.
              </p>
            </div>
          )
        ) : (
          <div className="bg-slate-900/90 rounded-3xl p-8 text-center border border-slate-800 text-slate-400 text-xs font-semibold">
            🔒 Bus details and locations hidden. Please enter the College Security Code above to unlock this college's bus fleet.
          </div>
        )}

      </div>
    </div>
  );
}
