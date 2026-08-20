import React, { useState } from 'react';
import { api } from '../services/api';
import { AlertOctagon, X, Send, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';

const ISSUE_TYPES = [
  'Bus Breakdown',
  'Tyre Problem',
  'Engine Problem',
  'Traffic Delay',
  'Accident / Incident',
  'Route Obstruction',
  'Other'
];

export default function ReportModal({ isOpen, onClose, driver, currentLocation, onSuccess }) {
  const [issueType, setIssueType] = useState('Bus Breakdown');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const reportPayload = {
      driver_id: driver?.driver_id || 'DRV-UNKNOWN',
      driver_name: driver?.name || 'Driver',
      bus_number: driver?.assigned_bus?.bus_number || 'AP-31-1234',
      issue_type: issueType,
      description,
      latitude: currentLocation?.latitude || 17.7120,
      longitude: currentLocation?.longitude || 83.0400,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      await api.post('/api/reports', reportPayload);
      setSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Report Emergency / Issue</h3>
              <p className="text-xs text-slate-500">Notify Admin & Students immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="font-bold text-xl text-slate-800">Report Submitted Successfully</h4>
            <p className="text-xs text-slate-500">College Administration has been alerted with your location telemetry.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            {/* Auto-Attached Info Bar */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-xs space-y-1.5">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Auto-Attached Metadata</div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                <div>🚌 Bus: <strong className="text-slate-900">{driver?.assigned_bus?.bus_number || 'AP-31-1234'}</strong></div>
                <div>👤 Driver: <strong className="text-slate-900">{driver?.name} ({driver?.driver_id})</strong></div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>{currentLocation?.latitude ? `${Number(currentLocation.latitude).toFixed(4)}, ${Number(currentLocation.longitude).toFixed(4)}` : 'GPS Acquired'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Issue Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Issue Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
              >
                {ISSUE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the issue clearly (e.g. Engine overheating near Ring Road, estimated delay 20 mins)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
