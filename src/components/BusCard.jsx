import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import CartoonBus from './CartoonBus';
import Card3DTilt from './Card3DTilt';
import { MapPin, Clock, ArrowRight, User } from 'lucide-react';

export default function BusCard({ bus }) {
  const isLive = bus.status === 'LIVE' || bus.status === 'ACTIVE';

  return (
    <Card3DTilt depth={20} className="h-full">
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between h-full group text-white">
        
        <div>
          {/* Header with Cartoon Real Bus */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-2xl bg-amber-500/10 border border-amber-500/30 group-hover:scale-105 transition-transform">
                <CartoonBus size="md" isDriving={isLive} />
              </div>
              <div>
                <h3 className="font-black text-lg text-white leading-tight">
                  {bus.bus_number}
                </h3>
                <p className="text-xs text-amber-400 font-medium">{bus.bus_name || 'College Shuttle'}</p>
              </div>
            </div>

            <StatusBadge status={bus.status} />
          </div>

          {/* Route Details */}
          <div className="my-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">{bus.route_name}</span>
            </div>

            <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Start:</span>
                <strong className="text-white font-semibold">{bus.start_point}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Destination:</span>
                <strong className="text-white font-semibold">{bus.destination}</strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Est. {bus.estimated_time || 60} mins</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">{bus.driver_name || 'Assigned Driver'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-800">
          <Link
            to={`/student/track/${bus.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-extrabold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg shadow-amber-500/20 transition-all group-hover:gap-3"
          >
            <span>Track Live Cartoon Bus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </Card3DTilt>
  );
}
