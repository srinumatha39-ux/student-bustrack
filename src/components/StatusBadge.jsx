import React from 'react';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = status?.toUpperCase() || 'INACTIVE';

  if (normalized === 'LIVE' || normalized === 'ACTIVE' || normalized === 'ON_TRIP') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        LIVE TRIP
      </span>
    );
  }

  if (normalized === 'RESOLVED' || normalized === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
        <CheckCircle className="w-3 h-3 text-blue-600" />
        {normalized}
      </span>
    );
  }

  if (normalized === 'PENDING' || normalized === 'ISSUE') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        {normalized}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <Clock className="w-3 h-3 text-slate-400" />
      INACTIVE
    </span>
  );
}
