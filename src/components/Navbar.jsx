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
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Header */}
          <div className="flex items-center gap-3.5">
            {!isHome && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="System Back Navigation"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <div className="group-hover:scale-105 transition-transform duration-300">
                <CartoonBus size="sm" isDriving={true} />
              </div>
              <div>
                <span className="font-black text-lg text-white tracking-tight block leading-none flex items-center gap-2">
                  Smart College Bus 3D
                  <span className="text-[10px] bg-amber-400/15 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-widest">
                    Real-Time Fleet
                  </span>
                </span>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                  College Transportation System
                </span>
              </div>
            </Link>
          </div>

          {/* User Nav Actions (Only show when logged in and NOT on Home page) */}
          <div className="flex items-center gap-3">
            {user && !isHome ? (
              <>
                {/* Role Indicator Badge */}
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-200 border border-slate-800">
                  {user.role === 'admin' && <Shield className="w-3.5 h-3.5 text-indigo-400" />}
                  {user.role === 'driver' && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                  {user.role === 'student' && <MapPin className="w-3.5 h-3.5 text-sky-400" />}
                  <span className="text-slate-400">{user.role}:</span>
                  <span className="text-white font-bold">{user.name || user.college_id || user.driver_id || user.roll_number}</span>
                </span>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </>
            ) : (
              !isHome && (
                <button
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md shadow-amber-500/20 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back Navigation
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
