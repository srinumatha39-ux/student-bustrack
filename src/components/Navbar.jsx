import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CartoonBus from './CartoonBus';
import { LogOut, Shield, MapPin, Building2, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const isHome = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2">
          
          {/* Brand Header */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            {!isHome && (
              <button
                onClick={handleGoBack}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors shrink-0"
                title="System Back Navigation"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
              <div className="group-hover:scale-105 transition-transform duration-300 shrink-0">
                <CartoonBus size="sm" isDriving={true} />
              </div>
              <div className="min-w-0">
                <span className="font-black text-sm sm:text-lg text-white tracking-tight block leading-tight truncate flex items-center gap-1.5">
                  <span className="truncate">Smart Bus 3D</span>
                  <span className="hidden sm:inline-block text-[9px] bg-amber-400/15 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-widest shrink-0">
                    Real-Time
                  </span>
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide truncate block">
                  Campus Fleet Network
                </span>
              </div>
            </Link>
          </div>

          {/* User Nav Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {user && !isHome ? (
              <>
                {/* Role Indicator Badge */}
                <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-200 border border-slate-800 max-w-[140px] sm:max-w-none truncate">
                  {user.role === 'admin' && <Shield className="w-3 h-3 text-indigo-400 shrink-0" />}
                  {user.role === 'driver' && <Building2 className="w-3 h-3 text-amber-400 shrink-0" />}
                  {user.role === 'student' && <MapPin className="w-3 h-3 text-sky-400 shrink-0" />}
                  <span className="hidden sm:inline text-slate-400">{user.role}:</span>
                  <span className="text-white font-bold truncate">{user.name || user.college_id || user.driver_id || user.roll_number}</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              !isHome && (
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
