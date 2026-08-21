import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Bus, Users, Shield, AlertTriangle, Activity, Plus, Trash2, CheckCircle,
  RefreshCw, ShieldAlert, Sparkles, Building2, Gauge, Clock, Search, X, Lock
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);

  // Modals state
  const [isAddBusOpen, setIsAddBusOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  // New Bus Form
  const [busForm, setBusForm] = useState({
    bus_number: '',
    bus_name: '',
    route_name: '',
    start_point: '',
    destination: '',
    estimated_time: 60,
    max_speed: 60,
    driver_name: '',
    driver_id: '',
    stops_input: 'Anakapalle Ring Road, Main Road Junction, Railway Station Gate, College Campus Gate'
  });

  // New Driver Form
  const [driverForm, setDriverForm] = useState({
    driver_id: '',
    name: '',
    password: '',
    secret_key: 'SEC-DRV-' + Math.floor(100 + Math.random() * 900),
    assigned_bus_id: ''
  });

  // New Student Form
  const [studentForm, setStudentForm] = useState({
    roll_number: '',
    college_id: '',
    name: '',
    password: '',
    secret_key: 'SEC-STU-' + Math.floor(100 + Math.random() * 900)
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    const b = await api.get('/api/buses');
    const d = await api.get('/api/drivers');
    const s = await api.get('/api/students');
    const r = await api.get('/api/reports');
    if (Array.isArray(b)) setBuses(b);
    if (Array.isArray(d)) setDrivers(d);
    if (Array.isArray(s)) setStudents(s);
    if (Array.isArray(r)) setReports(r);
  };

  const handleAddBus = async (e) => {
    e.preventDefault();
    const stopsList = busForm.stops_input.split(',').map((name, i) => ({
      id: 'st_' + i,
      stop_name: name.trim(),
      latitude: 17.6896 + i * 0.015,
      longitude: 83.0024 + i * 0.02,
      stop_order: i + 1
    }));

    await api.post('/api/buses', {
      ...busForm,
      stops: stopsList
    });
    setIsAddBusOpen(false);
    loadAllData();
  };

  const handleDeleteBus = async (id) => {
    if (confirm('Are you sure you want to decommission this transit vehicle?')) {
      await api.delete(`/api/buses/${id}`);
      loadAllData();
    }
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    await api.post('/api/drivers', driverForm);
    setIsAddDriverOpen(false);
    loadAllData();
  };

  const handleDeleteDriver = async (id) => {
    if (confirm('Revoke operator credentials?')) {
      await api.delete(`/api/drivers/${id}`);
      loadAllData();
    }
  };

  const handleGenerateDriverKey = (driverId) => {
    const key = 'SEC-DRV-' + Math.floor(1000 + Math.random() * 9000);
    alert(`Generated Security Key for Operator ${driverId}: ${key}`);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    await api.post('/api/students', studentForm);
    setIsAddStudentOpen(false);
    loadAllData();
  };

  const handleDeleteStudent = async (id) => {
    if (confirm('Revoke student passenger account?')) {
      await api.delete(`/api/students/${id}`);
      loadAllData();
    }
  };

  const handleResolveReport = async (id) => {
    await api.put(`/api/reports/${id}/resolve`, {});
    loadAllData();
  };

  const handleDeleteReport = async (id) => {
    await api.delete(`/api/reports/${id}`);
    loadAllData();
  };

  const activeBusesCount = buses.filter(b => b.status === 'LIVE' || b.status === 'ACTIVE').length;
  const pendingReportsCount = reports.filter(r => r.status === 'PENDING').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-4 sm:p-8 text-white relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Command Center Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                System Operations Command
              </span>
              <span className="text-xs text-slate-400 font-medium">• Live Telemetry Monitor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Fleet Administration & Operations Console
            </h1>
          </div>

          <button
            onClick={loadAllData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors self-start md:self-auto shadow-md"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            Sync Telemetry Feeds
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'overview', label: 'Operations Overview', icon: Activity },
            { id: 'buses', label: `Managed Vehicles (${buses.length})`, icon: Bus },
            { id: 'drivers', label: `Fleet Operators (${drivers.length})`, icon: Users },
            { id: 'students', label: `Enrolled Passengers (${students.length})`, icon: Users },
            { id: 'active_users', label: 'Telemetry Monitor', icon: ShieldAlert },
            { id: 'reports', label: `Service Alerts (${reports.length})`, icon: AlertTriangle, badge: pendingReportsCount }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SECTION A: OVERVIEW CARDS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              
              <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Bus className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-white">{buses.length}</div>
                <div className="text-xs text-slate-400 font-medium">Managed Vehicles</div>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{activeBusesCount}</div>
                <div className="text-xs text-slate-400 font-medium">Active Dispatches</div>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-white">{drivers.length}</div>
                <div className="text-xs text-slate-400 font-medium">Fleet Operators</div>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-white">{students.length}</div>
                <div className="text-xs text-slate-400 font-medium">Registered Passengers</div>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  <Gauge className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-white">{activeBusesCount}</div>
                <div className="text-xs text-slate-400 font-medium">Live Telemetry Streams</div>
              </div>

              <div className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-rose-400">{reports.length}</div>
                <div className="text-xs text-slate-400 font-medium">Service Hazard Alerts</div>
              </div>

            </div>

            {/* Fleet Status Table (Trip controls removed — Trip start/stop owned exclusively by Drivers) */}
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="font-extrabold text-lg text-white">Transit Fleet Telemetry Status</h3>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Trip dispatches are started exclusively by Drivers
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buses.map((bus) => (
                  <div key={bus.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-white font-bold">{bus.bus_number}</strong>
                        <StatusBadge status={bus.status} />
                      </div>
                      <div className="text-xs text-slate-400 font-medium">{bus.route_name}</div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                        Driver: <span className="text-amber-300">{bus.driver_name || 'Assigned Driver'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION B: BUS MANAGEMENT */}
        {activeTab === 'buses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-white">Transit Fleet & Route Configuration</h2>
                <p className="text-xs text-slate-400 mt-0.5">Configure buses and routes. Drivers control live trip dispatches.</p>
              </div>
              <button
                onClick={() => setIsAddBusOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle & Route
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {buses.map((bus) => (
                <div key={bus.id} className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg text-white">{bus.bus_number}</span>
                        <StatusBadge status={bus.status} />
                      </div>
                      <p className="text-xs text-amber-400 font-medium">{bus.bus_name}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBus(bus.id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Decommission Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-2xl space-y-1.5 text-xs text-slate-300 border border-slate-800">
                    <div><strong className="text-slate-400">Route:</strong> {bus.route_name}</div>
                    <div><strong className="text-slate-400">Start → Destination:</strong> {bus.start_point} → {bus.destination}</div>
                    <div><strong className="text-slate-400">Assigned Driver:</strong> {bus.driver_name || 'Assigned Driver'}</div>
                    <div><strong className="text-slate-400">Est. Journey Time:</strong> {bus.estimated_time || 60} mins | Speed Limit: {bus.max_speed || 60} km/h</div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-300 mb-2">Configured Waypoint Stops:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {bus.stops?.map((st, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-xl bg-slate-950 text-[11px] font-semibold text-slate-300 border border-slate-800">
                          {i + 1}. {st.stop_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                      <Lock className="w-3 h-3" /> Trip dispatch owned by Driver
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION C: DRIVER MANAGEMENT */}
        {activeTab === 'drivers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white">Transit Operator Credentials & Roster</h2>
              <button
                onClick={() => setIsAddDriverOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Enroll New Operator
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="p-4">Operator Name</th>
                    <th className="p-4">Operator ID</th>
                    <th className="p-4">Authorization Secret Key</th>
                    <th className="p-4">Assigned Vehicle</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {drivers.map((drv) => (
                    <tr key={drv.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">{drv.name}</td>
                      <td className="p-4 font-mono font-semibold text-slate-300">{drv.driver_id}</td>
                      <td className="p-4 font-mono text-amber-300 font-bold bg-amber-500/10 rounded px-2.5 py-1 border border-amber-500/20">{drv.secret_key}</td>
                      <td className="p-4 font-medium text-slate-300">{buses.find(b => b.id === drv.assigned_bus_id)?.bus_number || 'Unassigned'}</td>
                      <td className="p-4"><StatusBadge status={drv.status} /></td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleGenerateDriverKey(drv.driver_id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 text-[11px] font-bold"
                        >
                          Reset Key
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(drv.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION D: STUDENT MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white">Passenger Registrations & Security Access</h2>
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                Register Student Account
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="p-4">Passenger Name</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">College ID</th>
                    <th className="p-4">Security Pass Code</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-white">{stu.name}</td>
                      <td className="p-4 font-mono font-semibold text-slate-300">{stu.roll_number}</td>
                      <td className="p-4 font-mono text-slate-400">{stu.college_id}</td>
                      <td className="p-4 font-mono text-sky-300 font-bold bg-sky-500/10 rounded px-2.5 py-1 border border-sky-500/20">{stu.secret_key}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteStudent(stu.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION E: ACTIVE USERS MONITOR */}
        {activeTab === 'active_users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Active Operator & Passenger Telemetry Monitor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Bus className="w-5 h-5 text-amber-400" />
                    Active Fleet Operators
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {drivers.length} Registered
                  </span>
                </div>
                <div className="space-y-3">
                  {drivers.map((d) => (
                    <div key={d.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <div className="font-bold text-white">{d.name} ({d.driver_id})</div>
                        <div className="text-slate-400">Assigned Vehicle: {buses.find(b => b.id === d.assigned_bus_id)?.bus_number || 'AP-31-1234'}</div>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-400" />
                    Active Passenger Sessions
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {students.length} Enrolled
                  </span>
                </div>
                <div className="space-y-3">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <div className="font-bold text-white">{s.name}</div>
                        <div className="text-slate-400">Roll No: {s.roll_number}</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ONLINE SESSION</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION F: REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-xl font-extrabold text-white">Incident & Service Hazard Triage Reports</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {rep.issue_type}
                      </span>
                      <h3 className="font-extrabold text-base text-white mt-2">Vehicle {rep.bus_number}</h3>
                    </div>
                    <StatusBadge status={rep.status} />
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 leading-relaxed">
                    {rep.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-medium">
                    <div>Operator: <strong className="text-white">{rep.driver_name}</strong></div>
                    <div>Logged At: <strong className="text-white">{rep.time} ({rep.date})</strong></div>
                    <div>Coordinates: <strong className="text-white font-mono">{rep.latitude?.toFixed(4)}, {rep.longitude?.toFixed(4)}</strong></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                    {rep.status !== 'RESOLVED' && (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md"
                      >
                        Mark Hazard Resolved
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteReport(rep.id)}
                      className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* MODALS WITH PROFESSIONAL STYLING */}
      {isAddBusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-extrabold text-base text-white">Provision New Vehicle Route</h3>
              <button onClick={() => setIsAddBusOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddBus} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300">Vehicle Identification Number</label>
                <input required value={busForm.bus_number} onChange={e => setBusForm({...busForm, bus_number: e.target.value})} placeholder="AP-31-1234" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300">Shuttle Name</label>
                  <input required value={busForm.bus_name} onChange={e => setBusForm({...busForm, bus_name: e.target.value})} placeholder="Campus Express" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Route Title</label>
                  <input required value={busForm.route_name} onChange={e => setBusForm({...busForm, route_name: e.target.value})} placeholder="Anakapalle → College" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300">Origin Waypoint</label>
                  <input required value={busForm.start_point} onChange={e => setBusForm({...busForm, start_point: e.target.value})} placeholder="Anakapalle" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white" />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Destination</label>
                  <input required value={busForm.destination} onChange={e => setBusForm({...busForm, destination: e.target.value})} placeholder="College Campus Gate" className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white" />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-300">Waypoint Stops (Comma Separated)</label>
                <input required value={busForm.stops_input} onChange={e => setBusForm({...busForm, stops_input: e.target.value})} className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddBusOpen(false)} className="px-4 py-2 rounded-xl font-bold text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400">Save Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
